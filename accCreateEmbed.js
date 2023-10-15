document.addEventListener("DOMContentLoaded", function() {
    const passwordInput = document.querySelector('#password_input');
    const confirmPasswordInput = document.querySelector('#password_confirm');
    const submitButton = document.querySelector('#create_submit');
    const passwordErrorDiv = document.querySelector('#password_error');
    const emailInput = document.querySelector('#email_input');
    const emailErrorDiv = document.querySelector('#email_error');

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
    }

    confirmPasswordInput.addEventListener('input', validatePasswords);
    passwordInput.addEventListener('input', validatePasswords);

    let emailTimeout;

    emailInput.addEventListener('input', function() {
        clearTimeout(emailTimeout);

        emailTimeout = setTimeout(function() {
            const email = emailInput.value;

            // Make a GET request to your Xano API endpoint to check if the email exists
            fetch(`https://x8ki-letl-twmt.n7.xano.io/api:nv0yguSi/user?filter=email eq "${email}"`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    //'Authorization': 'Bearer YOUR_API_KEY' // Replace with your Xano API key
                }
            })
            .then(response => response.json())
            .then(data => {

                const emailExists = data.some(user => user.email === email);

                if (emailExists) {
                    emailErrorDiv.style.display = 'block';
                    emailErrorDiv.innerText = 'Email already exists in the database.';
                    emailErrorDiv.style.color = 'red';
                } else {
                    emailErrorDiv.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }, 3000); // 3 seconds delay// 3 seconds delay
    });
});
