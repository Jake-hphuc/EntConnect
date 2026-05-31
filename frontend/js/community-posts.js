/**
 * EntConnect - Community Posts Module
 * Handles rendering, creating, and interacting with posts in a community.
 */

const communityPosts = {
    currentCommunityId: null,

    init(communityId) {
        this.currentCommunityId = communityId;
        this.renderPosts();
        this.bindEvents();
    },

    bindEvents() {
        const btnCreate = document.getElementById('btnCreatePost');
        if (btnCreate && !btnCreate.hasAttribute('data-bound')) {
            btnCreate.addEventListener('click', () => this.createPost());
            btnCreate.setAttribute('data-bound', 'true');
        }
    },

    getPosts() {
        if (!window.communityData) return [];
        const allPosts = JSON.parse(localStorage.getItem('ent_community_posts')) || {};
        return allPosts[this.currentCommunityId] || [];
    },

    savePosts(posts) {
        const allPosts = JSON.parse(localStorage.getItem('ent_community_posts')) || {};
        allPosts[this.currentCommunityId] = posts;
        localStorage.setItem('ent_community_posts', JSON.stringify(allPosts));
    },

    renderPosts() {
        const container = document.getElementById('posts-container');
        if (!container) return;

        const posts = this.getPosts();
        
        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-file-earmark-post"></i>
                    <h5>Chưa có bài đăng nào</h5>
                    <p>Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!</p>
                </div>
            `;
            return;
        }

        let html = '';
        // Reverse to show newest first
        [...posts].reverse().forEach(post => {
            html += `
                <div class="post-card reveal-on-scroll">
                    <div class="post-header">
                        <img src="${post.authorAvatar}" alt="${post.authorName}" class="post-avatar">
                        <div>
                            <h6 class="post-author">${post.authorName}</h6>
                            <span class="post-time">${post.time}</span>
                        </div>
                    </div>
                    <div class="post-content">
                        ${post.content.replace(/\n/g, '<br>')}
                    </div>
                    <div class="post-actions">
                        <button class="post-action-btn ${post.isLiked ? 'active' : ''}" onclick="communityPosts.toggleLike('${post.id}')">
                            <i class="bi ${post.isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i> ${post.likes} Thích
                        </button>
                        <button class="post-action-btn" onclick="alert('Tính năng bình luận đang được phát triển!')">
                            <i class="bi bi-chat"></i> ${post.comments} Bình luận
                        </button>
                        <button class="post-action-btn ms-auto" onclick="alert('Tính năng chia sẻ đang được phát triển!')">
                            <i class="bi bi-share"></i> Chia sẻ
                        </button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
        if (window.communityPage && typeof window.communityPage.triggerReveal === 'function') {
            window.communityPage.triggerReveal();
        }
    },

    createPost() {
        const input = document.getElementById('newPostContent');
        if (!input) return;

        const content = input.value.trim();
        if (!content) {
            api.toast('Vui lòng nhập nội dung bài viết', 'error');
            return;
        }

        // Generate mock post
        const userStr = localStorage.getItem('entconnect_user');
        const user = userStr ? JSON.parse(userStr) : null;
        const authorName = user ? user.username : 'Khách (Guest)';
        const authorAvatar = user && user.avatar ? user.avatar : 'https://ui-avatars.com/api/?name=' + authorName + '&background=random';

        const newPost = {
            id: 'p_' + Date.now(),
            authorName: authorName,
            authorAvatar: authorAvatar,
            time: 'Vừa xong',
            content: content,
            likes: 0,
            comments: 0,
            isLiked: false
        };

        const posts = this.getPosts();
        posts.push(newPost); // Append to end, we reverse when rendering
        this.savePosts(posts);

        input.value = ''; // clear
        this.renderPosts();
        api.toast('Đăng bài thành công!', 'success');
    },

    toggleLike(postId) {
        const posts = this.getPosts();
        const post = posts.find(p => p.id === postId);
        if (post) {
            if (post.isLiked) {
                post.isLiked = false;
                post.likes = Math.max(0, post.likes - 1);
            } else {
                post.isLiked = true;
                post.likes++;
            }
            this.savePosts(posts);
            this.renderPosts(); // Re-render to show updated likes
        }
    }
};

window.communityPosts = communityPosts;
