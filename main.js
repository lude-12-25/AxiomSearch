// Get references to DOM elements
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.getElementById('searchButton');
        const searchIcon = document.getElementById('searchIcon');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const resultsContainer = document.getElementById('resultsContainer');
        const searchResultsDiv = document.getElementById('searchResults');
        const resultsList = document.getElementById('resultsList');
        const currentQuerySpan = document.getElementById('currentQuery');
        const errorMessageDiv = document.getElementById('errorMessage');
        const errorTextSpan = document.getElementById('errorText');
        const initialPromptDiv = document.getElementById('initialPrompt');
        const messageBox = document.getElementById('messageBox');
        const messageBoxText = document.getElementById('messageBoxText');
        const closeMessageBoxButton = document.getElementById('closeMessageBox');

        // Set the current year in the footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Focus on the search input when the page loads
        window.onload = function() {
            searchInput.focus();
        };

        // Function to show a custom message box
        function showMessageBox(text, type = 'info') {
            messageBoxText.textContent = text;
            messageBox.className = `fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform visible ${
                type === 'error' ? 'bg-red-600 text-white' :
                type === 'warning' ? 'bg-yellow-500 text-white' :
                'bg-blue-500 text-white'
            } flex items-center justify-between space-x-4`;

            // Automatically hide the message after some time for non-error messages
            if (type !== 'error') {
                setTimeout(() => {
                    hideMessageBox();
                }, 3000);
            }
        }

        // Function to hide the custom message box
        function hideMessageBox() {
            messageBox.classList.remove('visible');
            setTimeout(() => {
                messageBox.className = 'fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center justify-between space-x-4';
            }, 300); // Allow transition to complete before resetting classes
        }

        // Event listener for closing the message box
        closeMessageBoxButton.addEventListener('click', hideMessageBox);

        // Asynchronous function to fetch search results from Wikipedia API
        async function fetchSearchResults(query) {
            if (!query.trim()) {
                showMessageBox('Please enter a search query.', 'warning');
                return;
            }

            // Show loading spinner, hide search icon
            searchIcon.classList.add('hidden');
            loadingSpinner.classList.remove('hidden');
            searchButton.disabled = true; // Disable button during search

            errorMessageDiv.classList.add('hidden'); // Hide any previous error
            searchResultsDiv.classList.add('hidden'); // Hide previous results
            initialPromptDiv.classList.add('hidden'); // Hide initial prompt
            resultsList.innerHTML = ''; // Clear previous results

            try {
                // Construct the Wikipedia API URL
                // Increased srlimit to 25 for more results
                const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=25&srprop=snippet|titlesnippet`;

                const response = await fetch(apiUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.query && data.query.search.length > 0) {
                    currentQuerySpan.textContent = query; // Set the current query text
                    searchResultsDiv.classList.remove('hidden'); // Show results container

                    data.query.search.forEach(result => {
                        const listItem = document.createElement('li');
                        listItem.className = 'border-b border-gray-100 pb-6 last:border-b-0 last:pb-0';
                        listItem.innerHTML = `
                            <a href="https://en.wikipedia.org/?curid=${result.pageid}" target="_blank" rel="noopener noreferrer" class="group block">
                                <h3 class="text-xl font-semibold text-blue-700 hover:underline group-hover:text-blue-800 transition-colors duration-150 mb-1">
                                    ${result.title}
                                </h3>
                                <p class="text-green-600 text-sm mb-2 truncate">
                                    https://en.wikipedia.org/?curid=${result.pageid}
                                </p>
                                <p class="text-gray-700 leading-relaxed text-base">
                                    ${result.snippet}...
                                </p>
                            </a>
                        `;
                        resultsList.appendChild(listItem);
                    });
                } else {
                    showMessageBox('No results found for your query. Please try another search.', 'info');
                    initialPromptDiv.classList.remove('hidden'); // Show initial prompt if no results
                }
            } catch (e) {
                console.error("Error fetching data:", e);
                errorTextSpan.textContent = 'Failed to fetch results. Please check your internet connection or try again later.';
                errorMessageDiv.classList.remove('hidden'); // Show error message
                showMessageBox('Failed to fetch results. Please try again later.', 'error');
                initialPromptDiv.classList.remove('hidden'); // Show initial prompt on error
            } finally {
                // Hide loading spinner, show search icon
                loadingSpinner.classList.add('hidden');
                searchIcon.classList.remove('hidden');
                searchButton.disabled = false; // Enable button
            }
        }

        // Handle form submission
        searchForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission (page reload)
            const query = searchInput.value;
            fetchSearchResults(query);
        });