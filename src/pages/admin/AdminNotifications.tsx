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
import { useTranslation } from 'react-i18next';

const AdminNotifications = () => {
  const { t } = useTranslation();
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
      toast.error(t('admin_notifications_page.fill_all_fields'));
      return;
    }
    
    try {
      await sendNotification.mutateAsync({
        user_id: notifForm.user_id,
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
      });
      toast.success(t('admin_notifications_page.notification_sent'));
      setShowSingle(false);
      resetForm();
    } catch (error) {
      toast.error(t('admin_notifications_page.notification_send_failed'));
    }
  };

  const handleSendBulk = async () => {
    if (selectedUsers.length === 0 || !notifForm.title || !notifForm.message) {
      toast.error(t('admin_notifications_page.select_users_and_fill_fields'));
      return;
    }
    
    try {
      await sendBulkNotification.mutateAsync({
        userIds: selectedUsers,
        title: notifForm.title,
        message: notifForm.message,
        type: notifForm.type,
      });
      toast.success(t('admin_notifications_page.notification_sent', { count: selectedUsers.length }));
      setShowBulk(false);
      setSelectedUsers([]);
      resetForm();
    } catch (error) {
      toast.error(t('admin_notifications_page.notification_send_failed'));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin_notifications_page.delete_notification_confirm'))) return;
    
    try {
      await deleteNotification.mutateAsync(id);
      toast.success(t('admin_notifications_page.notification_deleted'));
    } catch (error) {
      toast.error(t('admin_notifications_page.notification_delete_failed'));
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
            <h1 className="text-2xl font-bold text-foreground">{t('admin_notifications_page.title')}</h1>
            <p className="text-muted-foreground">{t('admin_notifications_page.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showSingle} onOpenChange={setShowSingle}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => { resetForm(); setShowSingle(true); }}>
                  <Send className="w-4 h-4 mr-2" />
                  {t('admin_notifications_page.send_to_user')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('admin_notifications_page.send_notification')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>{t('admin_notifications_page.select_user')}</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={notifForm.user_id}
                      onChange={(e) => setNotifForm({ ...notifForm, user_id: e.target.value })}
                    >
                      <option value="">{t('admin_notifications_page.select_user')}</option>
                      {profiles?.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                          {profile.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin_notifications_page.type')}</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={notifForm.type}
                      onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                    >
                      <option value="info">{t('admin_notifications_page.info')}</option>
                      <option value="success">{t('admin_notifications_page.success')}</option>
                      <option value="warning">{t('admin_notifications_page.warning')}</option>
                      <option value="error">{t('admin_notifications_page.error')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin_notifications_page.title_label')}</Label>
                    <Input
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin_notifications_page.message_label')}</Label>
                    <Textarea
                      value={notifForm.message}
                      onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSendSingle}>
                    {t('admin_notifications_page.send_notification')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showBulk} onOpenChange={setShowBulk}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setSelectedUsers([]); setShowBulk(true); }}>
                  <Users className="w-4 h-4 mr-2" />
                  {t('admin_notifications_page.bulk_send')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t('admin_notifications_page.send_bulk_notification')}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>{t('admin_notifications_page.select_users', { count: selectedUsers.length })}</Label>
                      <Button variant="ghost" size="sm" onClick={selectAllUsers}>
                        {selectedUsers.length === profiles?.length ? t('admin_notifications_page.deselect_all') : t('admin_notifications_page.select_all')}
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
                    <Label>{t('admin_notifications_page.type')}</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={notifForm.type}
                      onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                    >
                      <option value="info">{t('admin_notifications_page.info')}</option>
                      <option value="success">{t('admin_notifications_page.success')}</option>
                      <option value="warning">{t('admin_notifications_page.warning')}</option>
                      <option value="error">{t('admin_notifications_page.error')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin_notifications_page.title_label')}</Label>
                    <Input
                      value={notifForm.title}
                      onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin_notifications_page.message_label')}</Label>
                    <Textarea
                      value={notifForm.message}
                      onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <Button className="w-full" onClick={handleSendBulk}>
                    {t('admin_notifications_page.send_to_users', { count: selectedUsers.length })}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>{t('admin_notifications_page.sent_notifications')} ({notifications?.length || 0})</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin_notifications_page.search_notifications')}
                  className="pl-10 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">{t('admin_notifications_page.loading_notifications')}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin_notifications_page.title_label')}</TableHead>
                      <TableHead>{t('admin_notifications_page.message_label')}</TableHead>
                      <TableHead>{t('admin_notifications_page.recipient')}</TableHead>
                      <TableHead>{t('admin_notifications_page.type')}</TableHead>
                      <TableHead>{t('admin_notifications_page.read')}</TableHead>
                      <TableHead>{t('admin_notifications_page.date')}</TableHead>
                      <TableHead>{t('admin_notifications_page.actions')}</TableHead>
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
                            {notif.is_read ? t('admin_notifications_page.read') : t('admin_notifications_page.unread')}
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
