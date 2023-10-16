document.addEventListener("DOMContentLoaded", function() {
    const passwordInput = document.querySelector('#password_input');
    const confirmPasswordInput = document.querySelector('#password_confirm');
    const submitButton = document.querySelector('#create_submit');
    const passwordErrorDiv = document.querySelector('#password_error');
    const emailInput = document.querySelector('#email_input');
    const emailErrorDiv = document.querySelector('#email_error');

    let emailTimeout;
    let emailIsValid = false;
    let emailExists = false;

    // Initially, hide the "Create Account" button
    submitButton.style.display = 'none';

    function validatePasswords() {
        const passwordValue = passwordInput.value;
        const confirmPasswordValue = confirmPasswordInput.value;

        // Check if passwords match
        if (passwordValue === confirmPasswordValue) {
            // Check if passwords meet complexity requirements
            if (
                passwordValue.length >= 8 &&
                /\d/.test(passwordValue) // Check if the password contains at least one digit
            ) {
                passwordErrorDiv.style.display = 'none';
            } else {
                passwordErrorDiv.style.display = 'block';
                passwordErrorDiv.innerText = 'Password must be at least 8 characters long and contain at least one number.';
                passwordErrorDiv.style.color = 'red';
            }
        } else {
            passwordErrorDiv.style.display = 'block';
            passwordErrorDiv.innerText = 'Passwords must match.';
            passwordErrorDiv.style.color = 'red';
        }

        checkValidity();
    }

    function validateEmail() {
        const email = emailInput.value;

        // Check if email contains the "@" symbol
        if (!/@/.test(email)) {
            emailErrorDiv.style.display = 'block';
            emailErrorDiv.innerText = 'Email must contain the "@" symbol.';
            emailErrorDiv.style.color = 'red';
            emailIsValid = false;
            emailInput.style.border = ''; // Reset border style
        } else {
            emailErrorDiv.style.display = 'none';
            emailInput.style.border = ''; // Reset border style

            // Clear the previous timeout, if any
            clearTimeout(emailTimeout);

            // Set a new timeout to validate email after 1.5 seconds of inactivity
            emailTimeout = setTimeout(function() {
                // Make a GET request to your Xano API endpoint to check if the email exists
                fetch(`https://x8ki-letl-twmt.n7.xano.io/api:nv0yguSi/user?filter=email eq "${email}"`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        // 'Authorization': 'Bearer YOUR_API_KEY' // Replace with your Xano API key
                    }
                })
                .then(response => response.json())
                .then(data => {
                    emailExists = data.some(user => user.email === email);

                    if (emailExists) {
                        emailErrorDiv.style.display = 'block';
                        emailErrorDiv.innerText = 'An account with this email already exists.';
                        emailErrorDiv.style.color = 'red';
                    } else {
                        emailErrorDiv.style.display = 'none';
                        emailInput.style.border = '2px solid green'; // Add green border for a valid email
                    }

                    checkValidity();
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            }, 500); // 1.5 seconds delay
        }
    }

    function checkValidity() {
        const passwordValue = passwordInput.value;
        const confirmPasswordValue = confirmPasswordInput.value;
        const emailValue = emailInput.value;

        const isPasswordValid = passwordValue.length >= 8 && /\d/.test(passwordValue);
        const isEmailValid = emailInput.checkValidity();
        const isFormValid = isPasswordValid && isEmailValid && (passwordValue === confirmPasswordValue) && !emailExists;

        if (isFormValid) {
            submitButton.style.display = 'block';
        } else {
            submitButton.style.display = 'none';
        }
    }

    confirmPasswordInput.addEventListener('input', validatePasswords);
    passwordInput.addEventListener('input', validatePasswords);
    emailInput.addEventListener('input', validateEmail);
});
