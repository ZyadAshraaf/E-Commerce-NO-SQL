
const deleteProduct=(btn)=>{
let productId = btn.parentNode.querySelector('[name=productId]').value;
let csrf = btn.parentNode.querySelector('[name=_csrf]').value;

let productELmenet = btn.closest("article")

fetch("/admin/product/"+productId, {
    method: 'DELETE',
    headers : {
        "csrf-token": csrf
    }
})
.then(result=>{
    return result.json()
})
.then(data=>{
    productELmenet.remove();
    console.log(data);
})
.catch(err=>console.log(err.message))
}