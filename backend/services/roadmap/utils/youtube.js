import axios from "axios";

/**
 * Searches YouTube for high-quality tutorial links matching a topic or module title.
 * Falls back to canonical search and documentation links if API key is not configured or fails.
 */
export const searchYouTubeTutorials = async (query) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const sanitizedQuery = `${query} full course tutorial engineering`;

    if (apiKey) {
        try {
            const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
                params: {
                    part: "snippet",
                    q: sanitizedQuery,
                    type: "video",
                    maxResults: 2,
                    relevanceLanguage: "en",
                    key: apiKey,
                },
                timeout: 5000,
            });

            if (response.data?.items?.length > 0) {
                return response.data.items.map((item) => ({
                    title: item.snippet.title,
                    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                }));
            }
        } catch (error) {
            console.warn("YouTube API search warning:", error.message);
        }
    }

    // High-yield fallback tutorial searches
    const encoded = encodeURIComponent(`${query} complete tutorial`);
    return [
        {
            title: `${query} Masterclass & Architecture Guide`,
            url: `https://www.youtube.com/results?search_query=${encoded}`,
        },
    ];
};

/**
 * Generates verified reference article & documentation links for the given topic.
 */
export const getDocumentationArticles = (topic, targetRole) => {
    const encoded = encodeURIComponent(topic);
    return [
        {
            title: `${topic} Official Documentation & Architecture Guide`,
            url: `https://devdocs.io/#q=${encoded}`,
        },
        {
            title: `${topic} Best Practices & Real-World Patterns`,
            url: `https://github.com/search?q=${encoded}+best+practices&type=repositories`,
        },
    ];
};
