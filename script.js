// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

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

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyBf3w3osCrlXqIRhbAcRFpYkg-JAVWCidQ",
        authDomain: "ac-experiment.firebaseapp.com",
        projectId: "ac-experiment",
        storageBucket: "ac-experiment.firebasestorage.app",
        messagingSenderId: "83447059204",
        appId: "1:83447059204:web:c1d18e7d50ee80e673f651",
        measurementId: "G-1BYENTEQ7Z"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log("Firebase initialized successfully");

     // Enable/disable post button based on content input
    postContent.addEventListener('input', () => {
        console.log("Textarea input:", postContent.value.trim());
        submitPostBtn.disabled = postContent.value.trim() === '';
        console.log("Submit button disabled:", submitPostBtn.disabled);
    });

    // Enable/disable revision button based on content input
    revisionContent.addEventListener('input', () => {
        console.log("Revision textarea input:", revisionContent.value.trim());
        submitRevisionBtn.disabled = revisionContent.value.trim() === '';
        console.log("Revision button disabled:", submitRevisionBtn.disabled);
    });

    // Unified `click` event listener for the "Post" button
    submitPostBtn.addEventListener('click', async () => {
        const content = postContent.value.trim();
        console.log("Post button clicked. Content:", content);

        if (content) {
            // Save the post to Firebase
            try {
                await addDoc(collection(db, "posts"), { content, type: "initial", timestamp: new Date() });
                console.log("Post saved to Firebase successfully");
            } catch (error) {
                console.error("Error saving post to Firebase:", error);
                alert("Failed to save post. Please try again.");
                return;
            }

            // Check hashtags and simulate algorithm behavior
            const usesRecommendedHashtags = checkHashtagCount(content);
            simulateAlgorithm(content, usesRecommendedHashtags);

            // Clear input, disable button, and show revision section
            postContent.value = '';
            submitPostBtn.disabled = true;
            revisionSection.classList.remove('hidden'); // Show the revision section
            localStorage.setItem('currentPost', content); // Store initial post for revision
        } else {
            alert('Please write something before posting!');
        }
    });

    // Submit revision logic
    submitRevisionBtn.addEventListener('click', async () => {
        const revisedContent = revisionContent.value.trim();
        const originalContent = localStorage.getItem('currentPost'); // Retrieve the initial post
        console.log("Submit revision clicked. Revised content:", revisedContent);

        if (originalContent && revisedContent) {
            try {
                await addDoc(collection(db, "posts"), { content: revisedContent, type: "revised", timestamp: new Date() });
                console.log("Revised post saved to Firebase successfully");
            } catch (error) {
                console.error("Error saving revised post to Firebase:", error);
                alert("Failed to save revised post. Please try again.");
                return;
            }

            // Save revised post locally
            const uniqueId = generateUniqueId(); // Generate a unique ID
            savePostPair(originalContent, revisedContent, uniqueId); // Save both as a pair locally

            // Clear revision input and disable revision button
            revisionContent.value = '';
            submitRevisionBtn.disabled = true;
            revisionSection.classList.add('hidden'); // Hide the revision section
            alert('Revised post saved successfully!');
        } else {
            alert('Please revise your post before submitting!');
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

    // Save original and revised posts as a pair with a unique ID locally
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

    // Calculate reach based on hashtag usage
    function getReach(usesRecommendedHashtags) {
        return usesRecommendedHashtags 
            ? Math.floor(Math.random() * (20 - 1 + 1)) + 1
            : Math.floor(Math.random() * (3 - 1 + 1)) + 1;
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
