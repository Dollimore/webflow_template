
document.addEventListener("DOMContentLoaded", function() {
    const passwordInput = document.querySelector('#password_input');
    const confirmPasswordInput = document.querySelector('#password_confirm');
    const submitButton = document.querySelector('#create_submit');
    const passwordErrorDiv = document.querySelector('#password_error');

    function validatePasswords() {
        if (passwordInput.value === confirmPasswordInput.value) {
            submitButton.style.display = 'block';
            passwordErrorDiv.style.display = 'none';
        } else {
            submitButton.style.display = 'none';
            passwordErrorDiv.style.display = 'block';
            passwordErrorDiv.innerText = 'Passwords must match';
            passwordErrorDiv.style.color = 'red';
        }
    }

    confirmPasswordInput.addEventListener('input', validatePasswords);
    passwordInput.addEventListener('input', validatePasswords);
});
