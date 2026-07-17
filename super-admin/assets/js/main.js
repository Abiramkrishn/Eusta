
$(function() {
	"use strict";

	// Dynamically append Eusta logo to topbar navbar on mobile
	if ($(".navbar").length && $(".mobile-logo").length === 0) {
		const mobileLogo = $(`
			<a href="index.html" class="mobile-logo d-xl-none" style="display: flex; align-items: center; text-decoration: none;">
				<img src="assets/images/logo.png" alt="Eusta" style="height: 32px; filter: brightness(1);">
			</a>
		`);
		$(".navbar").prepend(mobileLogo);
	}

	// Dynamically append premium mobile bottom navigation bar if it doesn't exist
	if ($(".mobile-bottom-nav").length === 0) {
		const bottomNav = $(`
			<div class="mobile-bottom-nav d-xl-none">
				<a href="index.html" class="nav-link-item" id="mobile-nav-dashboard">
					<span class="material-symbols-outlined">home</span>
					<span class="nav-text">Dashboard</span>
				</a>
				<a href="users.html" class="nav-link-item" id="mobile-nav-users">
					<span class="material-symbols-outlined">group</span>
					<span class="nav-text">Users</span>
				</a>
				<a href="subscriptions.html" class="nav-link-item" id="mobile-nav-subscriptions">
					<span class="material-symbols-outlined">card_membership</span>
					<span class="nav-text">Subscriptions</span>
				</a>
				<a href="settings.html" class="nav-link-item" id="mobile-nav-settings">
					<span class="material-symbols-outlined">settings</span>
					<span class="nav-text">Settings</span>
				</a>
			</div>
		`);
		$("body").append(bottomNav);

		// Highlight active menu link based on current path location
		let currentLocation = window.location.pathname.split("/").pop();
		if (currentLocation === "" || currentLocation === "/") {
			currentLocation = "index.html";
		}
		bottomNav.find(".nav-link-item").each(function() {
			let href = $(this).attr("href");
			if (href === currentLocation) {
				$(this).addClass("nav-active");
			}
		});
	}

	// app dropdown
	if (document.querySelector(".app-container")) {
		new PerfectScrollbar(".app-container");
	}
	if (document.querySelector(".header-notifications-list")) {
		new PerfectScrollbar(".header-notifications-list");
	}



$(".dark-mode span").click(function () {
	$(this).text(function(i, v){
	   return v === 'dark_mode' ? 'light_mode' : 'dark_mode'
	})
});



$(function() {
	$("#menu").metisMenu()
})


$(".btn-toggle-menu").click(function() {
	$("body").hasClass("toggled") ? ($("body").removeClass("toggled"), $(".sidebar-wrapper").unbind("hover")) : ($("body").addClass("toggled"), $(".sidebar-wrapper").hover(function() {
		$("body").addClass("sidebar-hovered")
	}, function() {
		$("body").removeClass("sidebar-hovered")
	}))
})





$(function() {
	for (var e = window.location, o = $(".sidebar-wrapper .metismenu li a").filter(function() {
			return this.href == e
		}).addClass("").parent().addClass("mm-active"); o.is("li");) o = o.parent("").addClass("mm-show").parent("").addClass("mm-active")
}),







// email 

$(".email-toggle-btn").on("click", function() {
	$(".email-wrapper").toggleClass("email-toggled")
}), $(".email-toggle-btn-mobile").on("click", function() {
	$(".email-wrapper").removeClass("email-toggled")
}), $(".compose-mail-btn").on("click", function() {
	$(".compose-mail-popup").show()
}), $(".compose-mail-close").on("click", function() {
	$(".compose-mail-popup").hide()
})


// chat 

$(".chat-toggle-btn").on("click", function() {
	$(".chat-wrapper").toggleClass("chat-toggled")
}), $(".chat-toggle-btn-mobile").on("click", function() {
	$(".chat-wrapper").removeClass("chat-toggled")
})




// switcher 

$("#LightTheme").on("click", function() {
	$("html").attr("data-bs-theme", "light")
}),

$("#DarkTheme").on("click", function() {
	$("html").attr("data-bs-theme", "dark")
}),

$("#SemiDarkTheme").on("click", function() {
	$("html").attr("data-bs-theme", "semi-dark")
}),

$("#MinimalTheme").on("click", function() {
	$("html").attr("data-bs-theme", "minimal-theme")
})

$("#ShadowTheme").on("click", function() {
	$("html").attr("data-bs-theme", "shadow-theme")
})


$(".dark-mode").click(function () {
	$("html").attr("data-bs-theme" , function(i, v){
	  return v === 'dark' ? 'light1' : 'dark';
	})
})



});