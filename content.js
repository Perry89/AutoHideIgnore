function removeIgnoredComments() {

    const ignored = document.querySelectorAll(
        ".comment--ignored, .comment--hidden, .comment-hidden"
    );

    ignored.forEach(comment => {
        comment.remove();
    });
}

removeIgnoredComments();

const observer = new MutationObserver(() => {
    removeIgnoredComments();
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});