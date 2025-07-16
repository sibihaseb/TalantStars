import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface VerificationResult {
  mediaId: number;
  exists: boolean;
  accessible: boolean;
  databaseConsistent: boolean;
  fileSize: number | null;
  mimeType: string | null;
  url: string | null;
  errors: string[];
}

interface UploadVerificationDisplayProps {
  mediaId: number;
  onVerificationComplete?: (result: VerificationResult) => void;
}

export function UploadVerificationDisplay({ mediaId, onVerificationComplete }: UploadVerificationDisplayProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const response = await apiRequest('POST', `/api/media/verify/${mediaId}`);
      const result = await response.json();
      
      setVerificationResult(result);
      onVerificationComplete?.(result);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationResult({
        mediaId,
        exists: false,
        accessible: false,
        databaseConsistent: false,
        fileSize: null,
        mimeType: null,
        url: null,
        errors: ['Verification request failed']
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  const getStatusBadge = (passed: boolean, label: string) => {
    return (
      <Badge variant={passed ? "default" : "destructive"} className="flex items-center gap-1">
        {getStatusIcon(passed)}
        {label}
      </Badge>
    );
  };

  const isFullyVerified = verificationResult && 
    verificationResult.exists && 
    verificationResult.accessible && 
    verificationResult.databaseConsistent && 
    verificationResult.errors.length === 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Upload Verification</CardTitle>
        <CardDescription>
          Verify your upload has been properly processed and stored
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Media ID: {mediaId}</span>
          <Button
            onClick={handleVerify}
            disabled={isVerifying}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Verify Upload
              </>
            )}
          </Button>
        </div>

        {verificationResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Record:</span>
                {getStatusBadge(verificationResult.exists, verificationResult.exists ? "Found" : "Missing")}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">File Accessible:</span>
                {getStatusBadge(verificationResult.accessible, verificationResult.accessible ? "Yes" : "No")}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Consistent:</span>
                {getStatusBadge(verificationResult.databaseConsistent, verificationResult.databaseConsistent ? "Yes" : "No")}
              </div>
            </div>

            {verificationResult.fileSize !== null && (
              <div className="text-sm text-gray-600">
                <div>File Size: {verificationResult.fileSize} bytes</div>
                <div>MIME Type: {verificationResult.mimeType}</div>
              </div>
            )}

            {verificationResult.url && (
              <div className="text-sm">
                <div className="font-medium">URL:</div>
                <div className="text-blue-600 break-all">{verificationResult.url}</div>
              </div>
            )}

            {isFullyVerified ? (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Upload verification successful! Your file has been properly uploaded, stored, and is accessible.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Upload verification failed. Please check the errors below and try uploading again.
                </AlertDescription>
              </Alert>
            )}

            {verificationResult.errors.length > 0 && (
              <div className="space-y-1">
                <div className="text-sm font-medium text-red-600">Errors:</div>
                {verificationResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}