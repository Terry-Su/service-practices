const signUpData = {
    username: 'foo',
    password: 'test1'
}
fetch( '/sign-up', {
    method : 'POST',
    body   : JSON.stringify( signUpData ),
    headers: {
        "Content-Type": "application/json"
      },
} )