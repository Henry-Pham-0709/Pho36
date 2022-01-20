// $(function () {
//     $(document).scroll(function () {
//         let $nav = $("#mainNavbar");
//         let $link = $("#link");
//         $nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
//         $link.toggleClass("scrolledLink", $(this).scrollTop() > $nav.height());
//     })
// })

window.addEventListener("scroll", function () {
    let nav = document.querySelector("#mainNavbar");
    nav.classList.toggle("scrolled", window.scrollY > 0)
    let links = document.querySelectorAll(".nav-link");
    for (let link of links) {
        link.classList.toggle("scrolledLink", window.scrollY > 0)
    }
})