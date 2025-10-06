// Student profiles array
let studentProfiles = [];
let editMode = false;
let currentEditId = null;

// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const profileCardsContainer = document.getElementById('profileCards');
const tableBody = document.getElementById('tableBody');
const noProfilesMessage = document.getElementById('noProfilesMessage');
const searchInput = document.getElementById('searchInput');
const ariaLive = document.getElementById('ariaLive');

// Load profiles from localStorage on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProfilesFromStorage();
    renderProfiles();
    updateNoProfilesMessage();
    
    // Add event listeners
    registrationForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('input', filterProfiles);
    
    // Add real-time validation
    const inputs = registrationForm.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
    });
});

// Form submission handler
function handleFormSubmit(event) {
    event.preventDefault();
    
    if (validateForm()) {
        if (editMode) {
            updateProfile();
        } else {
            createProfile();
        }
    }
}

// Validate the entire form
function validateForm() {
    let isValid = true;
    
    // Validate each required field
    const requiredFields = ['firstName', 'lastName', 'email', 'programme', 'year'];
    requiredFields.forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    if (emailField.value && !isValidEmail(emailField.value)) {
        showError(emailField, 'Please enter a valid email address');
        isValid = false;
    }
    
    return isValid;
}

// Validate a single field
function validateField(eventOrField) {
    const field = eventOrField.target || eventOrField;
    const fieldName = field.id;
    const value = field.value.trim();
    
    // Clear previous error
    clearError(field);
    
    // Check if field is required and empty
    if (field.hasAttribute('required') && !value) {
        showError(field, `${getFieldLabel(fieldName)} is required`);
        return false;
    }
    
    // Special validation for email
    if (fieldName === 'email' && value && !isValidEmail(value)) {
        showError(field, 'Please enter a valid email address');
        return false;
    }
    
    return true;
}

// Show error message for a field
function showError(field, message) {
    const errorElement = document.getElementById(`${field.id}Error`);
    errorElement.textContent = message;
    errorElement.classList.add('show');
    field.setAttribute('aria-invalid', 'true');
}

// Clear error message for a field
function clearError(field) {
    const errorElement = document.getElementById(`${field.id}Error`);
    errorElement.textContent = '';
    errorElement.classList.remove('show');
    field.removeAttribute('aria-invalid');
}

// Get field label for error messages
function getFieldLabel(fieldName) {
    const labels = {
        firstName: 'First name',
        lastName: 'Last name',
        email: 'Email',
        programme: 'Programme',
        year: 'Year'
    };
    return labels[fieldName] || fieldName;
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Create a new profile
function createProfile() {
    const formData = new FormData(registrationForm);
    
    // Create profile object
    const profile = {
        id: Date.now().toString(), // Simple ID generation
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        email: formData.get('email').trim(),
        programme: formData.get('programme'),
        year: formData.get('year'),
        interests: formData.get('interests').trim(),
        photoUrl: formData.get('photoUrl').trim() || 'https://via.placeholder.com/100'
    };
    
    // Add to profiles array
    studentProfiles.push(profile);
    
    // Save to localStorage
    saveProfilesToStorage();
    
    // Render the new profile
    renderProfiles();
    
    // Reset form
    registrationForm.reset();
    
    // Announce success to screen readers
    announceToScreenReader(`Student ${profile.firstName} ${profile.lastName} has been registered successfully`);
    
    // Update no profiles message
    updateNoProfilesMessage();
}

// Update an existing profile
function updateProfile() {
    const formData = new FormData(registrationForm);
    
    // Find the profile to update
    const profileIndex = studentProfiles.findIndex(profile => profile.id === currentEditId);
    
    if (profileIndex !== -1) {
        // Update profile data
        studentProfiles[profileIndex] = {
            ...studentProfiles[profileIndex],
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            email: formData.get('email').trim(),
            programme: formData.get('programme'),
            year: formData.get('year'),
            interests: formData.get('interests').trim(),
            photoUrl: formData.get('photoUrl').trim() || 'https://via.placeholder.com/100'
        };
        
        // Save to localStorage
        saveProfilesToStorage();
        
        // Render updated profiles
        renderProfiles();
        
        // Reset form and exit edit mode
        registrationForm.reset();
        editMode = false;
        currentEditId = null;
        
        // Update submit button text
        const submitButton = registrationForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Register Student';
        
        // Announce success to screen readers
        announceToScreenReader(`Student profile updated successfully`);
    }
}

// Remove a profile
function removeProfile(id) {
    // Find profile to get name for announcement
    const profile = studentProfiles.find(p => p.id === id);
    const profileName = profile ? `${profile.firstName} ${profile.lastName}` : 'Student';
    
    // Remove from array
    studentProfiles = studentProfiles.filter(profile => profile.id !== id);
    
    // Save to localStorage
    saveProfilesToStorage();
    
    // Render updated profiles
    renderProfiles();
    
    // Announce removal to screen readers
    announceToScreenReader(`${profileName} has been removed from the system`);
    
    // Update no profiles message
    updateNoProfilesMessage();
}

// Edit a profile
function editProfile(id) {
    // Find the profile to edit
    const profile = studentProfiles.find(profile => profile.id === id);
    
    if (profile) {
        // Populate form with profile data
        document.getElementById('firstName').value = profile.firstName;
        document.getElementById('lastName').value = profile.lastName;
        document.getElementById('email').value = profile.email;
        document.getElementById('programme').value = profile.programme;
        document.getElementById('year').value = profile.year;
        document.getElementById('interests').value = profile.interests;
        document.getElementById('photoUrl').value = profile.photoUrl;
        
        // Set edit mode
        editMode = true;
        currentEditId = id;
        
        // Update submit button text
        const submitButton = registrationForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Update Profile';
        
        // Focus on first field for accessibility
        document.getElementById('firstName').focus();
        
        // Announce edit mode to screen readers
        announceToScreenReader(`Editing profile for ${profile.firstName} ${profile.lastName}`);
    }
}

// Render all profiles
function renderProfiles() {
    // Clear existing content
    profileCardsContainer.innerHTML = '';
    tableBody.innerHTML = '';
    
    // Add each profile
    studentProfiles.forEach(profile => {
        createProfileCard(profile);
        createTableRow(profile);
    });
    
    // Show no profiles message if needed
    updateNoProfilesMessage();
}

// Create a profile card
function createProfileCard(profile) {
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.setAttribute('data-id', profile.id);
    
    card.innerHTML = `
        <div class="profile-header">
            <img src="${profile.photoUrl}" alt="Profile photo of ${profile.firstName} ${profile.lastName}" class="profile-photo" onerror="this.src='https://via.placeholder.com/100'">
            <div class="profile-name">${profile.firstName} ${profile.lastName}</div>
            <div class="profile-programme">${profile.programme} - Year ${profile.year}</div>
        </div>
        <div class="profile-body">
            <div class="profile-detail">
                <span class="profile-detail-label">Email:</span>
                <span>${profile.email}</span>
            </div>
            <div class="profile-detail">
                <span class="profile-detail-label">Interests:</span>
                <span>${profile.interests || 'Not specified'}</span>
            </div>
        </div>
        <div class="profile-actions">
            <button class="btn-edit" onclick="editProfile('${profile.id}')">Edit</button>
            <button class="btn-danger" onclick="removeProfile('${profile.id}')">Remove</button>
        </div>
    `;
    
    profileCardsContainer.appendChild(card);
}

// Create a table row
function createTableRow(profile) {
    const row = document.createElement('tr');
    row.setAttribute('data-id', profile.id);
    
    row.innerHTML = `
        <td>${profile.firstName} ${profile.lastName}</td>
        <td>${profile.email}</td>
        <td>${profile.programme}</td>
        <td>Year ${profile.year}</td>
        <td class="table-actions">
            <button class="btn-edit" onclick="editProfile('${profile.id}')">Edit</button>
            <button class="btn-danger" onclick="removeProfile('${profile.id}')">Remove</button>
        </td>
    `;
    
    tableBody.appendChild(row);
}

// Filter profiles based on search input
function filterProfiles() {
    const searchTerm = searchInput.value.toLowerCase();
    
    // Filter profile cards
    const cards = profileCardsContainer.querySelectorAll('.profile-card');
    cards.forEach(card => {
        const profileId = card.getAttribute('data-id');
        const profile = studentProfiles.find(p => p.id === profileId);
        
        if (profile && (
            profile.firstName.toLowerCase().includes(searchTerm) ||
            profile.lastName.toLowerCase().includes(searchTerm) ||
            profile.programme.toLowerCase().includes(searchTerm) ||
            profile.interests.toLowerCase().includes(searchTerm)
        )) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Filter table rows
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        const profileId = row.getAttribute('data-id');
        const profile = studentProfiles.find(p => p.id === profileId);
        
        if (profile && (
            profile.firstName.toLowerCase().includes(searchTerm) ||
            profile.lastName.toLowerCase().includes(searchTerm) ||
            profile.programme.toLowerCase().includes(searchTerm) ||
            profile.interests.toLowerCase().includes(searchTerm)
        )) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Update no profiles message visibility
function updateNoProfilesMessage() {
    if (studentProfiles.length === 0) {
        noProfilesMessage.classList.remove('hidden');
    } else {
        noProfilesMessage.classList.add('hidden');
    }
}

// Save profiles to localStorage
function saveProfilesToStorage() {
    localStorage.setItem('studentProfiles', JSON.stringify(studentProfiles));
}

// Load profiles from localStorage
function loadProfilesFromStorage() {
    const storedProfiles = localStorage.getItem('studentProfiles');
    if (storedProfiles) {
        studentProfiles = JSON.parse(storedProfiles);
    }
}

// Announce messages to screen readers
function announceToScreenReader(message) {
    ariaLive.textContent = message;
    
    // Clear the message after a short delay so it can be announced again
    setTimeout(() => {
        ariaLive.textContent = '';
    }, 1000);
}