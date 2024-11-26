document.addEventListener("DOMContentLoaded", () => {
    const postFeed = document.getElementById('post-feed');
    const submitPostBtn = document.getElementById('submit-post');
    const postContent = document.getElementById('post-content');
    const feedbackMessage = document.getElementById('feedback-message');
    const engagementScoreElement = document.getElementById('engagement-score');
    const adRevenueElement = document.getElementById('reward-message');
    const revisionSection = document.getElementById('revision-section');
    const submitRevisionBtn = document.getElementById('submit-revision');
    const revisionContent = document.getElementById('revision-content');
    const downloadButton = document.getElementById("download-data-btn");

    let engagementScore = 0;
    let totalRevenue = 0.00;

    const hashtags = [
        '#livingmybestlife', '#hustleculture', '#riseandgrind', '#nofilter', 
        '#selfmade', '#goodvibesonly', '#goals', '#influencerlife', 
        '#grateful', '#workhardplayhard', '#fitfam', '#bodygoals', 
        '#successmindset', '#girlboss', '#bossbabe', '#luxurylife', '#adulting'
    ];

    // Enable/disable post button based on content input
    postContent.addEventListener('input', () => {
        submitPostBtn.disabled = postContent.value.trim() === '';
    });

    // Enable/disable revision button based on content input
    revisionContent.addEventListener('input', () => {
        submitRevisionBtn.disabled = revisionContent.value.trim() === '';
    });

    // Initial Post Submission Logic
    submitPostBtn.addEventListener('click', () => {
        const content = postContent.value.trim();
        const usesRecommendedHashtags = checkHashtagCount(content);

        if (content) {
            simulateAlgorithm(content, usesRecommendedHashtags);
            postContent.value = '';
            submitPostBtn.disabled = true;
            revisionSection.classList.remove('hidden'); // Show the revision section
            localStorage.setItem('currentPost', content); // Store initial post temporarily
        } else {
            alert('Please write something before posting!');
        }
    });

    // Check if at least three recommended hashtags are used
    function checkHashtagCount(content) {
        let hashtagCount = 0;
        hashtags.forEach(hashtag => {
            if (content.includes(hashtag)) {
                hashtagCount++;
            }
        });
        return hashtagCount >= 3; // Returns true if at least 3 hashtags are used
    }

    // Revised Post Submission Logic
    submitRevisionBtn.addEventListener('click', () => {
        const revisedContent = revisionContent.value.trim();
        const originalContent = localStorage.getItem('currentPost'); // Retrieve the initial post

        if (originalContent && revisedContent) {
            const uniqueId = generateUniqueId(); // Generate a unique ID
            savePostPair(originalContent, revisedContent, uniqueId); // Save both as a pair
            revisionContent.value = ''; // Clear revision input
            submitRevisionBtn.disabled = true; // Disable revision button
            revisionSection.classList.add('hidden'); // Hide revision section
        } else {
            alert('Please revise your post before submitting!');
        }
    });

    // Save original and revised posts as a pair with a unique ID
    function savePostPair(original, revised, id) {
        let postPairs = JSON.parse(localStorage.getItem("postPairs")) || [];
        postPairs.push({ id, original, revised }); // Add ID to each post pair
        localStorage.setItem("postPairs", JSON.stringify(postPairs));
        localStorage.removeItem('currentPost'); // Clear temporary storage
    }

    // Generate a unique identifier (using timestamp + random number for simplicity)
    function generateUniqueId() {
        return `id-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }

    // Download post pairs as a JSON file
    downloadButton.addEventListener("click", () => {
        const postPairs = JSON.parse(localStorage.getItem("postPairs")) || [];
        if (postPairs.length === 0) {
            alert("No data to download.");
            return;
        }

        const dataStr = JSON.stringify(postPairs, null, 2); // Convert to JSON string
        const blob = new Blob([dataStr], { type: "application/json" }); // Create a Blob object
        const url = URL.createObjectURL(blob); // Create a URL for the blob

        const a = document.createElement("a"); // Create a temporary link element
        a.href = url;
        a.download = "postData.json"; // Set the download file name
        a.click(); // Trigger the download

        URL.revokeObjectURL(url); // Clean up the URL
    });

    // Simulate algorithm behavior based on hashtag usage
    function simulateAlgorithm(content, usesRecommendedHashtags) {
        const reachPercentage = getReach(usesRecommendedHashtags);
        const engagementDelta = getEngagementDelta(usesRecommendedHashtags);
        const revenueAmount = getRevenueAmount(usesRecommendedHashtags);

        displayPost(content);

        feedbackMessage.textContent = usesRecommendedHashtags
            ? `Your post reached ${reachPercentage}% of your followers! Good job using recommended hashtags!`
            : `Your post only reached ${reachPercentage}% of your followers. We encourage you to use recommended hashtags to reach a larger audience.`;
        feedbackMessage.className = usesRecommendedHashtags ? 'success' : 'error';

        updateEngagementScore(engagementDelta, usesRecommendedHashtags);
        updateRevenue(revenueAmount, usesRecommendedHashtags);

        revisionSection.classList.remove('hidden');
    }

    // Display the post in the feed
    function displayPost(content) {
        const post = document.createElement('div');
        post.classList.add('post');
        post.innerHTML = `<p>${content}</p>`;
        postFeed.prepend(post);
    }

    // Calculate reach based on hashtag usage
    function getReach(usesRecommendedHashtags) {
        return usesRecommendedHashtags 
            ? Math.floor(Math.random() * (30 - 1 + 1)) + 1
            : Math.floor(Math.random() * (5 - 1 + 1)) + 1;
    }

    // Calculate engagement delta based on hashtag usage
    function getEngagementDelta(usesRecommendedHashtags) {
        return usesRecommendedHashtags 
            ? Math.random() * (5 - 4) + 4 // Range: 2.6 to 5
            : Math.random() * (1.3 - 1) + 1;  // Range: 1 to 2.5
    }

    // Calculate revenue based on hashtag usage
    function getRevenueAmount(usesRecommendedHashtags) {
        const revenue = usesRecommendedHashtags 
            ? Math.random() * (1 - 2) + 2
            : Math.random() * (1 - 2) + 2;
        return revenue;
    }

    // Update the engagement score display with conditional messaging
    function updateEngagementScore(delta, usesRecommendedHashtags) {
        engagementScore = Math.max(0, Math.min(5, engagementScore + delta));
        engagementScoreElement.textContent = usesRecommendedHashtags
            ? `Great job! Your engagement score increased to ${engagementScore.toFixed(1)}/5. Keep using recommended hashtags to boost engagement!`
            : `You received a low engagement score of ${engagementScore.toFixed(1)}/5 . Using the platform recommended hastags may boost your engagement.`;
        engagementScoreElement.className = usesRecommendedHashtags ? 'success' : 'error';
    }

    // Update the total revenue earned with conditional messaging
    function updateRevenue(amount, usesRecommendedHashtags) {
        totalRevenue += amount;
        adRevenueElement.textContent = usesRecommendedHashtags
            ? `Awesome! You have earned $${totalRevenue.toFixed(2)} in ad revenue thanks to your hashtag choices. Keep it up!`
            : `You have earned $${totalRevenue.toFixed(2)} in ad revenue. You could use recommended hashtags to increase your earnings.`;
        adRevenueElement.className = usesRecommendedHashtags ? 'success' : 'error';
    }
});
