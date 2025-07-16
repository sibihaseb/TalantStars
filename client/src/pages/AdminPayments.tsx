import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  RefreshCw, 
  Search,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  Eye,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";

interface PaymentTransaction {
  id: number;
  userId: number;
  stripePaymentIntentId: string;
  amount: string;
  currency: string;
  status: string;
  paymentMethod: string;
  tierId?: number;
  isAnnual: boolean;
  description: string;
  receiptUrl?: string;
  refundedAmount: string;
  refundReason?: string;
  refundedAt?: string;
  createdAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

interface PaymentAnalytics {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  refundRate: number;
  averageTransaction: number;
}

interface RevenueData {
  period: string;
  revenue: number;
  transactions: number;
}

export default function AdminPayments() {
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [refundDialog, setRefundDialog] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    period: "daily"
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch payment analytics summary
  const { data: analytics, isLoading: analyticsLoading } = useQuery<PaymentAnalytics>({
    queryKey: ["/api/admin/payments/analytics/summary"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/payments/analytics/summary");
      return res.json();
    }
  });

  // Fetch revenue data
  const { data: revenueData, isLoading: revenueLoading } = useQuery<RevenueData[]>({
    queryKey: ["/api/admin/payments/analytics/revenue", filters.period],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/admin/payments/analytics/revenue?period=${filters.period}`);
      return res.json();
    }
  });

  // Fetch payment transactions
  const { data: transactions, isLoading: transactionsLoading, refetch } = useQuery<PaymentTransaction[]>({
    queryKey: ["/api/admin/payments", currentPage, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "50",
        status: filters.status,
      });
      
      const res = await apiRequest("GET", `/api/admin/payments?${params}`);
      return res.json();
    }
  });

  // Refund mutation
  const refundMutation = useMutation({
    mutationFn: async ({ transactionId, amount, reason, adminNotes }: {
      transactionId: number;
      amount?: string;
      reason: string;
      adminNotes: string;
    }) => {
      const res = await apiRequest("POST", `/api/admin/payments/${transactionId}/refund`, {
        amount,
        reason,
        adminNotes
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Refund Processed",
        description: "The refund has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments/analytics/summary"] });
      setRefundDialog(false);
      setRefundAmount("");
      setRefundReason("");
      setAdminNotes("");
    },
    onError: (error: any) => {
      toast({
        title: "Refund Failed",
        description: error.message || "Failed to process refund",
        variant: "destructive",
      });
    }
  });

  const handleRefund = () => {
    if (!selectedTransaction) return;
    
    refundMutation.mutate({
      transactionId: selectedTransaction.id,
      amount: refundAmount || undefined,
      reason: refundReason,
      adminNotes
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "succeeded":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "refunded":
        return <Badge className="bg-purple-100 text-purple-800"><RotateCcw className="w-3 h-3 mr-1" />Refunded</Badge>;
      case "partially_refunded":
        return <Badge className="bg-yellow-100 text-yellow-800"><RotateCcw className="w-3 h-3 mr-1" />Partial Refund</Badge>;
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const filteredTransactions = transactions?.filter(transaction => {
    const matchesStatus = filters.status === "all" || transaction.status === filters.status;
    const matchesSearch = filters.search === "" || 
      transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.user?.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      transaction.user?.username.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <Button onClick={() => refetch()} disabled={transactionsLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? "Loading..." : formatCurrency(analytics?.totalRevenue?.toString() || "0")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? "Loading..." : analytics?.totalTransactions?.toLocaleString() || "0"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {analyticsLoading ? "Loading..." : `${analytics?.successRate || 0}%`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {analyticsLoading ? "Loading..." : `${analytics?.refundRate || 0}%`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Transaction</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsLoading ? "Loading..." : formatCurrency(analytics?.averageTransaction?.toString() || "0")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Trends</CardTitle>
            <Select value={filters.period} onValueChange={(value) => setFilters(prev => ({ ...prev, period: value }))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="h-40 flex items-center justify-center">Loading revenue data...</div>
          ) : (
            <div className="space-y-4">
              {revenueData?.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{item.period}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.revenue.toString())}</div>
                      <div className="text-sm text-gray-500">{item.transactions} transactions</div>
                    </div>
                    {index > 0 && revenueData[index - 1] && (
                      <div className="flex items-center">
                        {item.revenue > revenueData[index - 1].revenue ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-64"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
                <SelectItem value="partially_refunded">Partially Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="h-40 flex items-center justify-center">Loading transactions...</div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions?.map((transaction) => (
                <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.user?.email || `User ${transaction.userId}`}
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.isAnnual ? 'Annual' : 'Monthly'}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {transaction.status === 'succeeded' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setRefundDialog(true);
                            }}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Refund
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {transaction.description && (
                    <div className="mt-2 text-sm text-gray-600">
                      {transaction.description}
                    </div>
                  )}
                  
                  {transaction.refundedAmount && parseFloat(transaction.refundedAmount) > 0 && (
                    <div className="mt-2 text-sm text-red-600">
                      Refunded: {formatCurrency(transaction.refundedAmount)}
                      {transaction.refundReason && ` - ${transaction.refundReason}`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Refund Dialog */}
      <Dialog open={refundDialog} onOpenChange={setRefundDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Refund</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTransaction && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium">Transaction Details</div>
                <div className="mt-2 space-y-1">
                  <div>Amount: {formatCurrency(selectedTransaction.amount)}</div>
                  <div>User: {selectedTransaction.user?.email || `User ${selectedTransaction.userId}`}</div>
                  <div>Date: {format(new Date(selectedTransaction.createdAt), 'MMM dd, yyyy HH:mm')}</div>
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium mb-2">Refund Amount (optional)</label>
              <Input
                type="number"
                step="0.01"
                placeholder={`Full refund: ${selectedTransaction ? formatCurrency(selectedTransaction.amount) : ''}`}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Refund Reason</label>
              <Select value={refundReason} onValueChange={setRefundReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="requested_by_customer">Requested by Customer</SelectItem>
                  <SelectItem value="duplicate">Duplicate Payment</SelectItem>
                  <SelectItem value="fraudulent">Fraudulent</SelectItem>
                  <SelectItem value="billing_error">Billing Error</SelectItem>
                  <SelectItem value="service_issue">Service Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Admin Notes</label>
              <Textarea
                placeholder="Add internal notes about this refund..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setRefundDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleRefund}
                disabled={!refundReason || refundMutation.isPending}
              >
                {refundMutation.isPending ? "Processing..." : "Process Refund"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}