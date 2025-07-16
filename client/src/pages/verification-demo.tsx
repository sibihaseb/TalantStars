import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UploadVerificationDisplay } from '@/components/media/UploadVerificationDisplay';
import { InfoIcon, Upload, Link as LinkIcon, CheckCircle2 } from 'lucide-react';

export default function VerificationDemo() {
  const [mediaId, setMediaId] = useState<string>('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationResults, setVerificationResults] = useState<any[]>([]);

  const handleVerify = () => {
    if (mediaId && !isNaN(Number(mediaId))) {
      setShowVerification(true);
    }
  };

  const handleVerificationComplete = (result: any) => {
    setVerificationResults(prev => [result, ...prev.slice(0, 4)]);
  };

  const exampleMediaIds = [
    { id: '1752699447857', type: 'File Upload', status: 'Working' },
    { id: '10', type: 'External Link', status: 'May Fail' },
    { id: '999', type: 'Non-existent', status: 'Will Fail' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Upload Verification System</h1>
          <p className="text-lg text-gray-600">
            Comprehensive validation system for file uploads and external media links
          </p>
        </div>

        <Alert className="border-blue-200 bg-blue-50">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            This verification system checks database consistency, file accessibility, and storage integrity for all uploads.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Verification Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                Test Verification
              </CardTitle>
              <CardDescription>
                Enter a media ID to verify upload integrity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mediaId">Media ID</Label>
                <Input
                  id="mediaId"
                  type="text"
                  placeholder="Enter media ID (e.g., 1752699447857)"
                  value={mediaId}
                  onChange={(e) => setMediaId(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleVerify}
                disabled={!mediaId || isNaN(Number(mediaId))}
                className="w-full"
              >
                Verify Upload
              </Button>

              <div className="space-y-2">
                <Label>Example Media IDs:</Label>
                <div className="space-y-1">
                  {exampleMediaIds.map((example) => (
                    <div key={example.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <code className="text-sm">{example.id}</code>
                        <Badge variant="secondary">{example.type}</Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMediaId(example.id)}
                      >
                        Use
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification Results */}
          {showVerification && (
            <UploadVerificationDisplay
              mediaId={Number(mediaId)}
              onVerificationComplete={handleVerificationComplete}
            />
          )}
        </div>

        {/* System Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                File Upload Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Database record existence check
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Wasabi S3 file accessibility validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  File size and MIME type verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Data consistency between storage systems
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                External Link Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  YouTube, Vimeo, SoundCloud support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Platform detection and validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  URL accessibility checking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Database storage verification
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Recent Verification Results */}
        {verificationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Verification Results</CardTitle>
              <CardDescription>
                Latest verification tests and their outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationResults.map((result, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Media ID: {result.mediaId}</span>
                      <Badge variant={result.exists && result.accessible && result.databaseConsistent ? "default" : "destructive"}>
                        {result.exists && result.accessible && result.databaseConsistent ? "✓ Verified" : "✗ Failed"}
                      </Badge>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Database: {result.exists ? "✓ Found" : "✗ Missing"}</div>
                      <div>Accessible: {result.accessible ? "✓ Yes" : "✗ No"}</div>
                      <div>Consistent: {result.databaseConsistent ? "✓ Yes" : "✗ No"}</div>
                      {result.errors.length > 0 && (
                        <div className="text-red-600">
                          Errors: {result.errors.join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}