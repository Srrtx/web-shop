const formLogin = document.querySelector('#formLogin');
formLogin.onsubmit = async function (e) {
    e.preventDefault();
    const username = formLogin['txtUsername'].value;
    const password = formLogin['txtPassword'].value;
    // console.log(username, password);
    try {
        const options = {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "username": username,
                "password": password
            }),
        };
        const response = await fetch('/login', options);
        if (response.ok) {
            const data = await response.text();
            // Notiflix.Report.success('Success', data, 'OK');
            location.replace(data);
        }
        else if (response.status == 401) {
            const data = await response.text();
            throw Error(data);
        }
        else {
            throw Error('Connection error');
        }
    } catch (err) {
        console.error(err.message);
        Notiflix.Report.failure('Error', err.message, 'Close');
    }
}