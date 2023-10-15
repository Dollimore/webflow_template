
document.addEventListener("DOMContentLoaded", function() {
    const passwordInput = document.querySelector('#password_input');
    const confirmPasswordInput = document.querySelector('#password_confirm');
    const submitButton = document.querySelector('#create_submit');
    const passwordErrorDiv = document.querySelector('#password_error');

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
                submitButton.style.display = 'block';
                passwordErrorDiv.style.display = 'none';
            } else {
                submitButton.style.display = 'none';
                passwordErrorDiv.style.display = 'block';
                passwordErrorDiv.innerText = 'Password must be at least 8 characters long and contain at least one number.';
                passwordErrorDiv.style.color = 'red';
            }
        } else {
            submitButton.style.display = 'none';
            passwordErrorDiv.style.display = 'block';
            passwordErrorDiv.innerText = 'Passwords must match.';
            passwordErrorDiv.style.color = 'red';
        }
    }

    confirmPasswordInput.addEventListener('input', validatePasswords);
    passwordInput.addEventListener('input', validatePasswords);
});
