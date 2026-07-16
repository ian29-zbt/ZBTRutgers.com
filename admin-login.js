(async()=>{
 const client=window.zbtSupabase; const form=document.querySelector('#login-form'); const msg=document.querySelector('#login-message');
 const {data:{session}}=await client.auth.getSession(); if(session) location.href='officer-dashboard.html';
 form.addEventListener('submit',async e=>{e.preventDefault();msg.textContent='Signing in…';const {error}=await client.auth.signInWithPassword({email:email.value.trim(),password:password.value});if(error){msg.textContent=error.message;return;}location.href='officer-dashboard.html';});
})();