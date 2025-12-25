'use client';

import { useEffect, useState, useRef } from 'react';
import { chatAPI, branchesAPI } from '@/lib/api';
import { getUser } from '@/lib/utils';
import { MessageCircle, Send, Image as ImageIcon, Paperclip, Users, Building2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import Cookies from 'js-cookie';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  message_type: 'text' | 'image' | 'file';
  content: string;
  is_read: boolean;
  created_at: string;
  attachments?: Array<{
    id: string;
    file_url: string;
    file_name: string;
    file_type: string;
    file_size: number;
  }>;
}

interface Conversation {
  id: string;
  branch_id: string;
  branch_name: string;
  branch_code: string;
  last_message_at: string;
  unread_count?: number;
  last_message?: string;
}

export default function ChatPage() {
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize Socket.io
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token },
      path: '/socket.io/'
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to chat server');
    });

    newSocket.on('receive_message', (message: Message) => {
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    });

    newSocket.on('user_typing', (data) => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    newSocket.on('conversation_updated', (conversationId: string) => {
      loadConversations();
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Load conversations and branches
  useEffect(() => {
    if (isAdmin) {
      loadConversations();
      loadBranches();
    } else {
      // For branch users, load their conversation with admin
      loadBranchConversation();
    }
  }, [isAdmin]);

  // Join conversation room when selected
  useEffect(() => {
    if (selectedConversation && socket) {
      socket.emit('join_conversation', selectedConversation.id);
      loadMessages(selectedConversation.id);

      return () => {
        socket.emit('leave_conversation', selectedConversation.id);
      };
    }
  }, [selectedConversation, socket]);

  const loadConversations = async () => {
    try {
      const response = await chatAPI.getAllConversations();
      setConversations(response.data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchesAPI.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const loadBranchConversation = async () => {
    try {
      // For branch users, get their branch ID from user profile
      const userBranches = await branchesAPI.getAll();
      if (userBranches.data && userBranches.data.length > 0) {
        const userBranch = userBranches.data[0]; // Assuming branch user is associated with one branch
        const response = await chatAPI.getOrCreateConversation(userBranch.id);
        setSelectedConversation(response.data);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const response = await chatAPI.getMessages(conversationId);
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!messageInput.trim() || !selectedConversation || !socket) return;

    const content = messageInput.trim();
    setMessageInput('');

    socket.emit('send_message', {
      conversationId: selectedConversation.id,
      content,
      messageType: 'text'
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedConversation) return;

    try {
      const response = await chatAPI.sendFileMessage(selectedConversation.id, file);
      setMessages((prev) => [...prev, response.data]);
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send file:', error);
      alert('Erreur lors de l\'envoi du fichier');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectBranch = async (branch: any) => {
    try {
      const response = await chatAPI.getOrCreateConversation(branch.id);
      setSelectedConversation(response.data);
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Aujourd\'hui';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <MessageCircle size={24} className="text-indigo-600" />
            {isAdmin ? 'Conversations' : 'Chat avec Admin'}
          </h2>
        </div>

        {/* Admin: Show list of branches/conversations */}
        {isAdmin && (
          <div className="flex-1 overflow-y-auto">
            {conversations.length > 0 ? (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-gray-500" />
                      <span className="font-semibold text-gray-900">{conv.branch_name}</span>
                    </div>
                    {conv.unread_count && conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{conv.branch_code}</p>
                  {conv.last_message && (
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.last_message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatDate(conv.last_message_at)}</p>
                </div>
              ))
            ) : (
              <div className="p-4">
                <p className="text-sm text-gray-500 mb-4">Aucune conversation active</p>
                <p className="text-xs text-gray-400 mb-3">Sélectionnez une branche pour démarrer:</p>
                <div className="space-y-2">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleSelectBranch(branch)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 size={14} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{branch.name}</span>
                      </div>
                      <p className="text-xs text-gray-500 ml-6">{branch.code}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Branch: Show admin info */}
        {!isAdmin && selectedConversation && (
          <div className="p-4 bg-indigo-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Administrateur</p>
                <p className="text-sm text-gray-600">En ligne</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Building2 size={24} className="text-indigo-600" />
                <div>
                  <h3 className="font-bold text-gray-900">{selectedConversation.branch_name}</h3>
                  <p className="text-sm text-gray-600">{selectedConversation.branch_code}</p>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id;
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-md px-4 py-2 rounded-lg ${
                          isOwnMessage
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold opacity-75">
                            {message.sender_name}
                          </span>
                          <span className="text-xs opacity-60">{formatTime(message.created_at)}</span>
                        </div>

                        {/* Text Message */}
                        {message.message_type === 'text' && (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}

                        {/* Image Message */}
                        {message.message_type === 'image' && message.attachments && (
                          <div className="mt-2">
                            <img
                              src={`http://localhost:5000${message.content}`}
                              alt="Image"
                              className="max-w-full rounded-lg cursor-pointer"
                              onClick={() => window.open(`http://localhost:5000${message.content}`, '_blank')}
                            />
                            <p className="text-xs mt-1 opacity-75">
                              {message.attachments[0]?.file_name}
                            </p>
                          </div>
                        )}

                        {/* File Message */}
                        {message.message_type === 'file' && message.attachments && (
                          <div className="mt-2 flex items-center gap-2">
                            <Paperclip size={16} />
                            <a
                              href={`http://localhost:5000${message.content}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline"
                            >
                              {message.attachments[0]?.file_name}
                            </a>
                            <span className="text-xs opacity-75">
                              ({(message.attachments[0]?.file_size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                    <p className="text-sm animate-pulse">En train d'écrire...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Joindre une image ou un fichier"
                >
                  <ImageIcon size={20} />
                </button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Écrivez votre message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm text-gray-400 mt-2">
                {isAdmin 
                  ? 'Choisissez une branche pour commencer à discuter'
                  : 'Votre conversation avec l\'administrateur apparaîtra ici'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

