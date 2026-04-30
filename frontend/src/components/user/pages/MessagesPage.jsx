import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Send, ArrowLeft, Search, Loader2, MessageSquare, Plus, X, Users, MessageCircle, UserPlus, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';

function Avatar({ user, size = 42 }) {
  const isOnline = user?.last_seen &&
    new Date(user.last_seen) > new Date(Date.now() - 5 * 60 * 1000);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {user?.avatar
        ? <img src={user.avatar} style={{ width: size, height: size, borderRadius: '12px', objectFit: 'cover' }} alt="" />
        : <div style={{ width: size, height: size, borderRadius: '12px', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: size * 0.4 }}>
            {user?.name?.charAt(0) ?? '?'}
          </div>
      }
      <span style={{
        position: 'absolute', bottom: '-2px', right: '-2px',
        width: '11px', height: '11px', borderRadius: '50%',
        background: isOnline ? '#10B981' : '#6B7280',
        border: '2px solid var(--bg-card)',
      }} />
    </div>
  );
}

function GroupAvatar({ group, size = 42 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '12px',
      background: 'linear-gradient(135deg, var(--brand), #1B365D)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, position: 'relative',
    }}>
      <Users size={size * 0.45} color="#fff" />
    </div>
  );
}

export default function MessagesPage() {
  const { userId }    = useParams();
  const [searchParams] = useSearchParams();
  const groupId        = searchParams.get('group');
  const navigate       = useNavigate();
  const { user: me }   = useAuth();

  // DM state
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages]           = useState([]);
  const [chatWith, setChatWith]           = useState(null);

  // Group state
  const [groups, setGroups]               = useState([]);
  const [groupData, setGroupData]         = useState(null);
  const [groupMessages, setGroupMessages] = useState([]);

  // Shared
  const [body, setBody]                   = useState('');
  const [sending, setSending]             = useState(false);
  const [loading, setLoading]             = useState(false);
  const [search, setSearch]               = useState('');
  const [tab, setTab]                     = useState('chats');
  const [onlineUsers, setOnlineUsers]     = useState([]);

  // Modals
  const [showNewChat, setShowNewChat]         = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showGroupInfo, setShowGroupInfo]     = useState(false);
  const [userSearch, setUserSearch]           = useState('');
  const [searchResults, setSearchResults]     = useState([]);
  const [searching, setSearching]             = useState(false);
  const [groupName, setGroupName]             = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [creating, setCreating]               = useState(false);

  const bottomRef = useRef(null);

  // ── Fetch conversations ──
  const fetchConversations = useCallback(() => {
    api.get('/messages').then(res => setConversations(res.data)).catch(() => {});
  }, []);

  // ── Fetch groups ──
  const fetchGroups = useCallback(() => {
    api.get('/groups').then(res => setGroups(res.data)).catch(() => {});
  }, []);

  // ── Fetch online users ──
  const fetchOnline = useCallback(() => {
    api.get('/users/online').then(res => setOnlineUsers(res.data)).catch(() => {});
  }, []);

  // ── Fetch DM messages ──
  const fetchMessages = useCallback(() => {
    if (!userId) return;
    api.get(`/messages/${userId}`).then(res => {
      setMessages(res.data.messages);
      setChatWith(res.data.with);
      setLoading(false);
    }).catch(() => {});
  }, [userId]);

  // ── Fetch group messages ──
  const fetchGroupMessages = useCallback(() => {
    if (!groupId) return;
    api.get(`/groups/${groupId}`).then(res => {
      setGroupData(res.data.group);
      setGroupMessages(res.data.messages);
      setLoading(false);
    }).catch(() => {});
  }, [groupId]);

  useEffect(() => {
    fetchConversations();
    fetchGroups();
    fetchOnline();
    const interval = setInterval(() => { fetchConversations(); fetchGroups(); fetchOnline(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchConversations, fetchGroups, fetchOnline]);

  useEffect(() => {
    if (userId) {
      setLoading(true);
      setGroupData(null);
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [userId, fetchMessages]);

  useEffect(() => {
    if (groupId) {
      setLoading(true);
      setChatWith(null);
      fetchGroupMessages();
      const interval = setInterval(fetchGroupMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [groupId, fetchGroupMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, groupMessages]);

  // ── Search users ──
  const searchUsers = useCallback(async (q) => {
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await api.get(`/users/search?q=${q}`);
      setSearchResults(res.data);
    } finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => searchUsers(userSearch), 300);
    return () => clearTimeout(delay);
  }, [userSearch, searchUsers]);

  // ── Send DM ──
  const handleSend = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    try {
      if (groupId) {
        await api.post(`/groups/${groupId}/messages`, { body });
        fetchGroupMessages();
      } else if (userId) {
        await api.post(`/messages/${userId}`, { body });
        fetchMessages();
        fetchConversations();
      }
      setBody('');
    } finally { setSending(false); }
  };

  // ── Create group ──
  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) return;
    setCreating(true);
    try {
      const res = await api.post('/groups', {
        name: groupName,
        member_ids: selectedMembers.map(u => u.id),
      });
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedMembers([]);
      fetchGroups();
      navigate(`/messages?group=${res.data.id}`);
    } finally { setCreating(false); }
  };

  // ── Leave group ──
  const handleLeaveGroup = async () => {
    if (!confirm('Leave this group?')) return;
    await api.delete(`/groups/${groupId}/members/${me.id}`);
    fetchGroups();
    navigate('/messages');
  };

  // ── Delete group ──
  const handleDeleteGroup = async () => {
    if (!confirm('Delete this group for everyone?')) return;
    await api.delete(`/groups/${groupId}`);
    fetchGroups();
    navigate('/messages');
  };

  const isGroupCreator = groupData?.created_by === me?.id;
  const activeMessages = groupId ? groupMessages : messages;
  const chatWithIsOnline = chatWith?.last_seen &&
    new Date(chatWith.last_seen) > new Date(Date.now() - 5 * 60 * 1000);

  const filteredConvos = conversations.filter(c =>
    c.user?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredGroups = groups.filter(g =>
    g.name?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Styles ──
  const sidebarStyle = {
    width: '320px', flexShrink: 0,
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex', flexDirection: 'column',
    background: 'var(--bg-card)',
  };

  const itemStyle = (isActive) => ({
    padding: '14px 20px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '12px',
    background: isActive ? 'var(--brand-dim)' : 'transparent',
    borderLeft: isActive ? '3px solid var(--brand)' : '3px solid transparent',
    borderBottom: '1px solid var(--border-subtle)',
    transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-main)', fontFamily: 'var(--font-body, system-ui)' }}>

      {/* ── SIDEBAR ── */}
      <div style={sidebarStyle}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '10px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', flexShrink: 0 }}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', flex: 1 }}>Messages</h2>
            <button onClick={() => setShowCreateGroup(true)} title="New Group"
              style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '10px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <Users size={16} />
            </button>
            <button onClick={() => setShowNewChat(true)} title="New Message"
              style={{ background: 'var(--brand)', border: 'none', borderRadius: '10px', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              <Plus size={16} />
            </button>
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
              style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '10px', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)' }}>
          {[
            { id: 'chats',  label: 'Chats',  count: conversations.length },
            { id: 'groups', label: 'Groups', count: groups.length },
            { id: 'online', label: 'Online', count: onlineUsers.length },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '10px 4px', border: 'none', cursor: 'pointer',
              background: 'transparent',
              borderBottom: tab === t.id ? '2px solid var(--brand)' : '2px solid transparent',
              color: tab === t.id ? 'var(--brand)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 700, transition: 'all 0.15s',
            }}>
              {t.label}
              {t.count > 0 && <span style={{ marginLeft: '4px', fontSize: '10px', background: tab === t.id ? 'var(--brand)' : 'var(--bg-card-hover)', color: tab === t.id ? '#fff' : 'var(--text-muted)', padding: '1px 5px', borderRadius: '20px' }}>{t.count}</span>}
            </button>
          ))}
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'chats' && (
            filteredConvos.length === 0
              ? <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No conversations. Click + to start one.</div>
              : filteredConvos.map((c, i) => {
                  const isActive = userId === String(c.user?.id) && !groupId;
                  return (
                    <div key={i} onClick={() => navigate(`/messages/${c.user?.id}`)} style={itemStyle(isActive)}>
                      <Avatar user={c.user} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.user?.name}</p>
                          {c.unread > 0 && <span style={{ background: 'var(--brand)', color: '#fff', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '20px', flexShrink: 0 }}>{c.unread}</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.last_message}</p>
                      </div>
                    </div>
                  );
                })
          )}

          {tab === 'groups' && (
            filteredGroups.length === 0
              ? <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No groups yet. Click the group icon to create one.</div>
              : filteredGroups.map((g) => {
                  const isActive = groupId === String(g.id);
                  return (
                    <div key={g.id} onClick={() => navigate(`/messages?group=${g.id}`)} style={itemStyle(isActive)}>
                      <GroupAvatar group={g} size={40} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name}</p>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', flexShrink: 0 }}>{g.members_count} members</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {g.last_message ?? 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  );
                })
          )}

          {tab === 'online' && (
            onlineUsers.length === 0
              ? <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>No users online.</div>
              : onlineUsers.map((u) => (
                  <div key={u.id} onClick={() => navigate(`/messages/${u.id}`)} style={{ padding: '14px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Avatar user={u} size={40} />
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#10B981', fontWeight: 600 }}>● Online</p>
                    </div>
                  </div>
                ))
          )}
        </div>
      </div>

      {/* ── CHAT AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!userId && !groupId ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
            <MessageSquare size={48} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', fontWeight: 600 }}>Select a conversation or start a new one</p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowNewChat(true)} style={{ background: 'var(--brand)', border: 'none', borderRadius: '12px', padding: '10px 20px', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={16} /> New Message
              </button>
              <button onClick={() => setShowCreateGroup(true)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '10px 20px', color: 'var(--text-primary)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={16} /> New Group
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--bg-card)' }}>
              {groupId ? (
                <>
                  <GroupAvatar group={groupData} size={38} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{groupData?.name ?? '...'}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>{groupData?.members?.length ?? 0} members</p>
                  </div>
                  <button onClick={() => setShowGroupInfo(true)} style={{ background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 700 }}>
                    Info
                  </button>
                </>
              ) : (
                <>
                  <Avatar user={chatWith} size={38} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{chatWith?.name ?? '...'}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: chatWithIsOnline ? '#10B981' : 'var(--text-muted)', fontWeight: 600 }}>
                      {chatWithIsOnline ? '● Online' : '○ Offline'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '40px' }}>
                  <Loader2 size={28} style={{ color: 'var(--brand)', animation: 'spin 1s linear infinite' }} />
                </div>
              ) : activeMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', paddingTop: '40px' }}>No messages yet. Say hello!</div>
              ) : activeMessages.map((msg) => {
                const isMine = (msg.sender_id ?? msg.user_id) === me?.id;
                const sender = groupId ? msg.user : (isMine ? me : chatWith);
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
                    {!isMine && <Avatar user={sender} size={26} />}
                    <div style={{ maxWidth: '65%' }}>
                      {groupId && !isMine && (
                        <p style={{ margin: '0 0 4px 4px', fontSize: '11px', fontWeight: 700, color: 'var(--brand)' }}>{sender?.name}</p>
                      )}
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        background: isMine ? 'var(--brand)' : 'var(--bg-card)',
                        border: isMine ? 'none' : '1px solid var(--border-subtle)',
                        color: isMine ? '#fff' : 'var(--text-primary)',
                        fontSize: '14px', lineHeight: 1.5,
                      }}>
                        <p style={{ margin: 0 }}>{msg.body}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '10px', opacity: 0.7, textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {!groupId && isMine && <span style={{ marginLeft: '4px' }}>{msg.is_read ? ' ✓✓' : ' ✓'}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} style={{ padding: '14px 24px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-card)' }}>
              <input value={body} onChange={e => setBody(e.target.value)}
                placeholder={groupId ? `Message ${groupData?.name ?? 'group'}...` : `Message ${chatWith?.name ?? ''}...`}
                style={{ flex: 1, padding: '11px 16px', borderRadius: '12px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', outline: 'none', fontSize: '14px', color: 'var(--text-primary)' }} />
              <button type="submit" disabled={sending || !body.trim()} style={{ width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0, background: 'var(--brand)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: sending || !body.trim() ? 0.5 : 1 }}>
                {sending ? <Loader2 size={16} color="#fff" /> : <Send size={16} color="#fff" />}
              </button>
            </form>
          </>
        )}
      </div>

      {/* ── GROUP INFO PANEL ── */}
      {showGroupInfo && groupData && (
        <div style={{ width: '280px', flexShrink: 0, borderLeft: '1px solid var(--border-subtle)', background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Group Info</h3>
            <button onClick={() => setShowGroupInfo(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
          </div>

          <GroupAvatar group={groupData} size={64} />
          <h4 style={{ margin: '14px 0 4px', fontSize: '18px', fontWeight: 900, color: 'var(--text-primary)', textAlign: 'center' }}>{groupData.name}</h4>
          <p style={{ margin: '0 0 20px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Created by {groupData.creator?.name}</p>

          <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
            Members ({groupData.members?.length})
          </p>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {groupData.members?.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', borderRadius: '10px', background: 'var(--bg-card-hover)' }}>
                <Avatar user={m} size={32} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                  <p style={{ margin: 0, fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{m.pivot?.role}</p>
                </div>
                {isGroupCreator && m.id !== me?.id && (
                  <button onClick={async () => { await api.delete(`/groups/${groupId}/members/${m.id}`); fetchGroupMessages(); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F43F5E', padding: '2px' }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {isGroupCreator ? (
              <button onClick={handleDeleteGroup} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Trash2 size={14} /> Delete Group
              </button>
            ) : (
              <button onClick={handleLeaveGroup} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#F43F5E', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <LogOut size={14} /> Leave Group
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── NEW CHAT MODAL ── */}
      {showNewChat && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => { setShowNewChat(false); setUserSearch(''); setSearchResults([]); }} />
          <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '420px', background: 'var(--bg-card)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>New Message</h3>
              <button onClick={() => { setShowNewChat(false); setUserSearch(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search users..." autoFocus
                style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '10px', paddingBottom: '10px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '12px', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>
            <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
              {searching ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><Loader2 size={22} style={{ color: 'var(--brand)' }} /></div>
              ) : !userSearch ? (
                onlineUsers.slice(0, 6).map(u => (
                  <div key={u.id} onClick={() => { setShowNewChat(false); setUserSearch(''); navigate(`/messages/${u.id}`); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Avatar user={u} size={36} />
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#10B981', fontWeight: 600 }}>● Online</p>
                    </div>
                  </div>
                ))
              ) : searchResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>No users found.</div>
              ) : searchResults.map(u => (
                <div key={u.id} onClick={() => { setShowNewChat(false); setUserSearch(''); navigate(`/messages/${u.id}`); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Avatar user={u} size={36} />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: u.is_online ? '#10B981' : 'var(--text-muted)' }}>
                      {u.is_online ? '● Online' : '○ Offline'} {u.filiere?.name ? `· ${u.filiere.name}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── CREATE GROUP MODAL ── */}
      {showCreateGroup && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => { setShowCreateGroup(false); setGroupName(''); setSelectedMembers([]); setUserSearch(''); setSearchResults([]); }} />
          <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px', background: 'var(--bg-card)', borderRadius: '20px', padding: '24px', border: '1px solid var(--border-subtle)', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)' }}>Create Group</h3>
              <button onClick={() => { setShowCreateGroup(false); setGroupName(''); setSelectedMembers([]); setUserSearch(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            {/* Group name */}
            <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Group name..."
              style={{ width: '100%', padding: '11px 16px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '12px', outline: 'none', fontSize: '14px', color: 'var(--text-primary)', marginBottom: '14px', boxSizing: 'border-box' }} />

            {/* Selected members */}
            {selectedMembers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                {selectedMembers.map(u => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(123,179,66,0.15)', border: '1px solid rgba(123,179,66,0.3)', borderRadius: '20px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brand)' }}>{u.name}</span>
                    <button onClick={() => setSelectedMembers(prev => prev.filter(m => m.id !== u.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand)', padding: 0, display: 'flex' }}><X size={12} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Search members */}
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Add members..."
                style={{ width: '100%', paddingLeft: '34px', paddingRight: '12px', paddingTop: '9px', paddingBottom: '9px', background: 'var(--bg-card-hover)', border: '1px solid var(--border-subtle)', borderRadius: '12px', outline: 'none', fontSize: '13px', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
            </div>

            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
              {(userSearch ? searchResults : onlineUsers).map(u => {
                const isSelected = selectedMembers.some(m => m.id === u.id);
                return (
                  <div key={u.id}
                    onClick={() => setSelectedMembers(prev => isSelected ? prev.filter(m => m.id !== u.id) : [...prev, u])}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px', borderRadius: '10px', cursor: 'pointer', background: isSelected ? 'rgba(123,179,66,0.1)' : 'transparent', marginBottom: '2px' }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Avatar user={u} size={32} />
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>{u.name}</p>
                    {isSelected && <span style={{ fontSize: '10px', fontWeight: 900, color: 'var(--brand)' }}>✓</span>}
                  </div>
                );
              })}
            </div>

            <button onClick={handleCreateGroup} disabled={creating || !groupName.trim() || selectedMembers.length === 0}
              style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--brand)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '14px', cursor: 'pointer', opacity: creating || !groupName.trim() || selectedMembers.length === 0 ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {creating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Users size={16} /> Create Group</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}