// ===================================================
// User Preferences & Recommendations
// ===================================================

const userPrefs = {
    favorites: [],
    interactedCategories: {},

    init() {
        this.load();
    },

    load() {
        const favs = localStorage.getItem('ent_favorites');
        this.favorites = favs ? JSON.parse(favs) : [];
        
        const interactions = localStorage.getItem('ent_interactions');
        this.interactedCategories = interactions ? JSON.parse(interactions) : {};
    },

    save() {
        localStorage.setItem('ent_favorites', JSON.stringify(this.favorites));
        localStorage.setItem('ent_interactions', JSON.stringify(this.interactedCategories));
    },

    toggleFavorite(eventId, category) {
        const index = this.favorites.indexOf(eventId);
        if (index === -1) {
            this.favorites.push(eventId);
            this.trackInteraction(category, 2); // Favoriting gives more weight
            api.toast('Đã lưu vào danh sách yêu thích!', 'success');
        } else {
            this.favorites.splice(index, 1);
            api.toast('Đã xóa khỏi danh sách yêu thích', 'info');
        }
        this.save();
        return index === -1; // Added
    },

    isFavorite(eventId) {
        return this.favorites.includes(eventId);
    },

    trackInteraction(category, weight = 1) {
        if (!category) return;
        this.interactedCategories[category] = (this.interactedCategories[category] || 0) + weight;
        this.save();
    },

    getRecommendations(allEvents, limit = 4) {
        if (!allEvents || allEvents.length === 0) return [];
        
        // Find top category
        const sortedCats = Object.entries(this.interactedCategories).sort((a, b) => b[1] - a[1]);
        const topCat = sortedCats.length > 0 ? sortedCats[0][0] : null;

        if (!topCat) {
            // If no history, recommend newest/high participants
            return [...allEvents].sort((a, b) => b.currentParticipants - a.currentParticipants).slice(0, limit);
        }

        // Filter and score
        const recommended = allEvents
            .filter(e => !this.favorites.includes(e._id)) // Suggest things not already favorited
            .map(e => {
                let score = 0;
                if (e.category === topCat) score += 10;
                // Add more logic if needed
                return { ...e, recommendationScore: score };
            })
            .sort((a, b) => b.recommendationScore - a.recommendationScore)
            .slice(0, limit);

        return recommended;
    }
};

// Start
userPrefs.init();
window.userPrefs = userPrefs;
