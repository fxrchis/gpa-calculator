// Additional feature to allow for notification pop ups
let toastBox = document.getElementById('toastBox');

// Creation of function to edit message and visibility of notification popup
function showToast(msg) {
    // Creates a temporary notification element
    let toast = document.createElement('div');
    toast.classList.add('toast');
    toast.innerHTML = msg;
    toastBox.appendChild(toast);

    // Removes notification after 6 seconds
    setTimeout(()=> {
        toast.remove();
    }, 6000);
}

export default showToast;