'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import apiClient from '@/lib/axios';
import { toast } from 'sonner';

export default function NotificationsPage() {
  const [tokens, setTokens] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

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
      setTokens('');
      setTitle('');
      setBody('');
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
              <Label htmlFor="tokens">FCM Tokens (one per line)</Label>
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
