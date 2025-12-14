import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  useAdminNotifications,
  useAdminProfiles,
  useSendNotification,
  useSendBulkNotification,
  useDeleteNotification,
} from '@/hooks/useAdminData';
import { Search, Trash2, Bell, Send, Users } from 'lucide-react';
import { toast } from 'sonner';

const AdminNotifications = () => {
  const { data: notifications, isLoading } = useAdminNotifications();
  const { data: profiles } = useAdminProfiles();
  const sendNotification = useSendNotification();
  const sendBulkNotification = useSendBulkNotification();
  const deleteNotification = useDeleteNotification();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showSingle, setShowSingle] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  
  const [notifForm, setNotifForm] = useState({
    user_id: '',
    title: '',
    message: '',
    type: 'info',
  });

  const getProfileEmail = (userId: string) => {
    const profile = profiles?.find(p => p.id === userId);
    return profile?.email || 'Unknown';
  };

  const filteredNotifications = notifications?.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendSingle = async () => {
    if (!notifForm.user_id || !notifForm.title || !notifForm.message) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      await sendNotification.mutateAsync({
        user_id: notifForm.user_id,
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
      });
      toast.success('Notification sent successfully');
      setShowSingle(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to send notification');
    }
  };

  const handleSendBulk = async () => {
    if (selectedUsers.length === 0 || !notifForm.title || !notifForm.message) {
      toast.error('Please select users and fill all fields');
      return;
    }
    
    try {
      await sendBulkNotification.mutateAsync({
        userIds: selectedUsers,
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
      });
      toast.success(`Notification sent to ${selectedUsers.length} users`);
      setShowBulk(false);
      setSelectedUsers([]);
      resetForm();
    } catch (error) {
      toast.error('Failed to send notifications');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await deleteNotification.mutateAsync(id);
      toast.success('Notification deleted successfully');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const resetForm = () => {
    setNotifForm({
      user_id: '',
      title: '',
      message: '',
      type: 'info',
    });
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === profiles?.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(profiles?.map(p => p.id) || []);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground">Send and manage user notifications</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showSingle} onOpenChange={setShowSingle}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => { resetForm(); setShowSingle(true); }}>
                  <Send className="w-4 h-4 mr-2" />
                  Send to User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send Notification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Select User</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={notifForm.user_id}
                      onChange={(e) => setNotifForm({ ...notifForm, user_id: e.target.value })}
                    >
                      <option value="">Select user...</option>
                      {profiles?.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={notifForm.type}
                      onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={notifForm.message}
                      onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSendSingle}>
                    Send Notification
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showBulk} onOpenChange={setShowBulk}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setSelectedUsers([]); setShowBulk(true); }}>
                  <Users className="w-4 h-4 mr-2" />
                  Bulk Send
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Send Bulk Notification</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Select Users ({selectedUsers.length} selected)</Label>
                      <Button variant="ghost" size="sm" onClick={selectAllUsers}>
                        {selectedUsers.length === profiles?.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    </div>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {profiles?.map((profile) => (
                        <label key={profile.id} className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(profile.id)}
                            onChange={() => toggleUserSelection(profile.id)}
                          />
                          <span className="text-sm">{profile.email}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={notifForm.type}
                      onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                    >
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      value={notifForm.message}
                      onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSendBulk}>
                    Send to {selectedUsers.length} Users
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Sent Notifications ({notifications?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading notifications...</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Read</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotifications?.map((notif) => (
                      <TableRow key={notif.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                              <Bell className="w-4 h-4 text-blue-500" />
                            </div>
                            <span className="font-medium">{notif.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{notif.message}</TableCell>
                        <TableCell>{getProfileEmail(notif.user_id)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            notif.type === 'success' ? 'default' :
                            notif.type === 'warning' ? 'secondary' :
                            notif.type === 'error' ? 'destructive' : 'outline'
                          }>
                            {notif.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={notif.is_read ? 'default' : 'secondary'}>
                            {notif.is_read ? 'Read' : 'Unread'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {notif.created_at ? new Date(notif.created_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(notif.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
