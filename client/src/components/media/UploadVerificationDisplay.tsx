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
  verificationAttempts: number;
  s3Accessible: boolean;
  databaseComplete: boolean;
  finalAttempt: boolean;
}

interface UploadVerificationDisplayProps {
  mediaId: number;
  onVerificationComplete?: (result: VerificationResult) => void;
}

export function UploadVerificationDisplay({ mediaId, onVerificationComplete }: UploadVerificationDisplayProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [autoRetry, setAutoRetry] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const handleVerify = async (isAutoRetry: boolean = false) => {
    setIsVerifying(true);
    if (!isAutoRetry) {
      setRetryCount(0);
    }
    
    try {
      const response = await apiRequest('POST', `/api/media/verify/${mediaId}`);
      const result = await response.json();
      
      console.log('Verification result:', result);
      setVerificationResult(result);
      onVerificationComplete?.(result);
      
      // Check if verification failed but we should auto-retry
      const isFullyVerified = result.exists && 
                             result.accessible && 
                             result.databaseConsistent && 
                             result.s3Accessible &&
                             result.databaseComplete;
      
      if (!isFullyVerified && autoRetry && retryCount < 10) {
        setRetryCount(prev => prev + 1);
        console.log(`Auto-retry ${retryCount + 1}/10 in 2 seconds...`);
        setTimeout(() => handleVerify(true), 2000);
      }
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
        errors: ['Verification request failed'],
        verificationAttempts: 0,
        s3Accessible: false,
        databaseComplete: false,
        finalAttempt: true
      });
    } finally {
      if (!autoRetry || retryCount >= 10) {
        setIsVerifying(false);
      }
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
    verificationResult.s3Accessible &&
    verificationResult.databaseComplete &&
    verificationResult.errors.length === 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Upload Verification</CardTitle>
        <CardDescription>
          Comprehensive verification with retry logic and S3 accessibility checks
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Media ID: {mediaId}</span>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={autoRetry}
                onChange={(e) => setAutoRetry(e.target.checked)}
                className="w-3 h-3"
              />
              Auto-retry
            </label>
            <Button
              onClick={() => handleVerify(false)}
              disabled={isVerifying}
              size="sm"
              variant="outline"
              className="flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  {autoRetry && retryCount > 0 ? `Retry ${retryCount}/10` : 'Verifying...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Verify Upload
                </>
              )}
            </Button>
          </div>
        </div>

        {verificationResult && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Record:</span>
                {getStatusBadge(verificationResult.exists, verificationResult.exists ? "Found" : "Missing")}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Complete:</span>
                {getStatusBadge(verificationResult.databaseComplete, verificationResult.databaseComplete ? "Yes" : "No")}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">S3 Accessible:</span>
                {getStatusBadge(verificationResult.s3Accessible, verificationResult.s3Accessible ? "Yes" : "No")}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Consistent:</span>
                {getStatusBadge(verificationResult.databaseConsistent, verificationResult.databaseConsistent ? "Yes" : "No")}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Verification Attempts:</span>
                <Badge variant="secondary">{verificationResult.verificationAttempts}</Badge>
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