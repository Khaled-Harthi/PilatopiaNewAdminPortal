'use client';

import { useState, useRef } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2, Upload } from 'lucide-react';
import apiClient from '@/lib/axios';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [tokens, setTokens] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Append to existing tokens (with newline separator if needed)
        const newTokens = tokens.trim()
          ? `${tokens.trim()}\n${content.trim()}`
          : content.trim();
        setTokens(newTokens);
        toast.success(`Loaded ${content.trim().split('\n').filter(t => t.trim()).length} tokens from file`);
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file');
    };
    reader.readAsText(file);

    // Reset file input so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = async () => {
    const tokenList = tokens
      .split('\n')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (tokenList.length === 0) {
      toast.error('Please enter at least one FCM token');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!body.trim()) {
      toast.error('Please enter a message body');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.post('/admin/notifications/send', {
        tokens: tokenList,
        title: title.trim(),
        body: body.trim(),
      });

      const { sent, failed, failures } = response.data;

      if (failed > 0 && failures) {
        toast.warning(`Sent: ${sent}, Failed: ${failed}`);
      } else {
        toast.success(`Notification sent to ${sent} device(s)`);
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      toast.error('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Push Notifications</h1>

        <Card>
          <CardHeader>
            <CardTitle>Send Notification</CardTitle>
            <CardDescription>
              Send push notifications to devices using FCM tokens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tokens">FCM Tokens (one per line)</Label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="token-file"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-1" />
                    Upload .txt
                  </Button>
                </div>
              </div>
              <Textarea
                id="tokens"
                placeholder="Paste FCM tokens here, one per line..."
                value={tokens}
                onChange={(e) => setTokens(e.target.value)}
                rows={5}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                placeholder="Notification message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={3}
              />
            </div>

            <Button onClick={handleSend} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
