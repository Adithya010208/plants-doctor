import React, { useState } from 'react';
import type { User, ForumPost, ForumReply } from '../types';
import { UsersIcon, PlusIcon } from './Icons';

interface SocialForumProps {
  user: User;
}

const MOCK_POSTS: ForumPost[] = [
    {
        id: '1',
        author: { name: 'John Farmer', picture: 'https://api.dicebear.com/8.x/initials/svg?seed=John' },
        title: 'Best time to plant tomatoes in a temperate climate?',
        content: 'I was wondering if anyone has advice on the optimal time to plant tomato seedlings outdoors. I am in a zone 6 climate. Last year a late frost got me!',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        replies: [
            { id: 'r1', author: { name: 'Agri-Expert Jane', picture: 'https://api.dicebear.com/8.x/initials/svg?seed=Jane' }, content: "A good rule of thumb is to wait about two weeks after your last expected frost date. Keep an eye on the 10-day forecast!", timestamp: new Date(Date.now() - 43200000).toISOString() }
        ]
    },
    {
        id: '2',
        author: { name: 'Maria G.', picture: 'https://api.dicebear.com/8.x/initials/svg?seed=Maria' },
        title: 'Natural pesticide recommendations for aphids',
        content: "My kale is getting overrun by aphids. Does anyone have effective organic or natural pesticide solutions that have worked for them? I'd prefer not to use harsh chemicals.",
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        replies: []
    }
];


export const SocialForum: React.FC<SocialForumProps> = ({ user }) => {
  const [posts, setPosts] = useState<ForumPost[]>(MOCK_POSTS);
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreatePost = (title: string, content: string) => {
    const newPost: ForumPost = {
        id: Date.now().toString(),
        author: { name: user.name, picture: user.picture },
        title,
        content,
        timestamp: new Date().toISOString(),
        replies: []
    };
    setPosts([newPost, ...posts]);
    setIsCreateModalOpen(false);
  };
  
  const handleAddReply = (postId: string, content: string) => {
    const newReply: ForumReply = {
        id: Date.now().toString(),
        author: { name: user.name, picture: user.picture },
        content,
        timestamp: new Date().toISOString()
    };
    setPosts(posts.map(p => p.id === postId ? { ...p, replies: [...p.replies, newReply] } : p));
  };

  const activePost = posts.find(p => p.id === activePostId);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Social Forum</h2>
        <p className="mt-2 text-md text-gray-600 dark:text-gray-300">Connect with other farmers, ask questions, and share your knowledge.</p>
      </div>

      {!activePost ? (
        <PostList posts={posts} onSelectPost={setActivePostId} onCreatePost={() => setIsCreateModalOpen(true)} />
      ) : (
        <PostDetailView post={activePost} onBack={() => setActivePostId(null)} onAddReply={handleAddReply} />
      )}

      {isCreateModalOpen && <CreatePostModal onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreatePost} />}
    </div>
  );
};

// --- Sub-components for SocialForum ---

const PostList: React.FC<{posts: ForumPost[], onSelectPost: (id: string) => void, onCreatePost: () => void}> = ({ posts, onSelectPost, onCreatePost }) => (
    <div>
        <div className="flex justify-end mb-4">
            <button onClick={onCreatePost} className="bg-primary-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-primary-700 flex items-center gap-2 transition-colors">
                <PlusIcon className="w-5 h-5"/> Create Post
            </button>
        </div>
        <div className="space-y-4">
            {posts.map(post => (
                <div key={post.id} onClick={() => onSelectPost(post.id)} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <div className="flex items-center mb-2">
                        <img src={post.author.picture} alt={post.author.name} className="w-8 h-8 rounded-full mr-3"/>
                        <span className="font-semibold text-gray-700 dark:text-gray-200">{post.author.name}</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 mx-2">•</span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(post.timestamp).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{post.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{post.content}</p>
                    <div className="text-right text-sm text-primary-600 font-semibold mt-2">{post.replies.length} replies</div>
                </div>
            ))}
        </div>
    </div>
);

const PostDetailView: React.FC<{post: ForumPost, onBack: () => void, onAddReply: (postId: string, content: string) => void}> = ({ post, onBack, onAddReply }) => {
    const [replyContent, setReplyContent] = useState('');

    const handleSubmitReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!replyContent.trim()) return;
        onAddReply(post.id, replyContent);
        setReplyContent('');
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <button onClick={onBack} className="text-primary-600 font-semibold mb-6">&larr; Back to all posts</button>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                 <div className="flex items-center mb-2">
                    <img src={post.author.picture} alt={post.author.name} className="w-10 h-10 rounded-full mr-3"/>
                    <div>
                        <span className="font-bold text-gray-800 dark:text-gray-100">{post.author.name}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.timestamp).toLocaleString()}</p>
                    </div>
                </div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white my-3">{post.title}</h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{post.content}</p>
            </div>
            
            <h3 className="text-xl font-bold mt-6 mb-4">Replies ({post.replies.length})</h3>
            <div className="space-y-5">
                {post.replies.map(reply => (
                    <div key={reply.id} className="flex items-start gap-3">
                        <img src={reply.author.picture} alt={reply.author.name} className="w-9 h-9 rounded-full mt-1"/>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                           <div className="flex items-center justify-between">
                             <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{reply.author.name}</span>
                             <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(reply.timestamp).toLocaleDateString()}</span>
                           </div>
                           <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{reply.content}</p>
                        </div>
                    </div>
                ))}
                {post.replies.length === 0 && <p className="text-sm text-gray-500">No replies yet. Be the first to comment!</p>}
            </div>

            <form onSubmit={handleSubmitReply} className="mt-8">
                <textarea 
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    rows={3}
                    className="w-full p-3 border rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-primary-500 focus:outline-none resize-none"
                    required
                />
                <div className="flex justify-end mt-2">
                    <button type="submit" className="bg-primary-600 text-white font-semibold py-2 px-5 rounded-lg hover:bg-primary-700 transition-colors">Post Reply</button>
                </div>
            </form>
        </div>
    );
};

const CreatePostModal: React.FC<{onClose: () => void, onCreate: (title: string, content: string) => void}> = ({ onClose, onCreate }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!title.trim() || !content.trim()) return;
        onCreate(title, content);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-6">Create a New Post</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input type="text" id="post-title" value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"/>
                    </div>
                    <div>
                        <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Content</label>
                        <textarea id="post-content" value={content} onChange={e => setContent(e.target.value)} required rows={5} className="mt-1 block w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 resize-none"></textarea>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="py-2 px-4 rounded-lg bg-primary-600 text-white hover:bg-primary-700">Create Post</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
