document.addEventListener("DOMContentLoaded", function () {
  /* =========================================================
     SIDE NAVIGATION
  ========================================================== */

  const menuBtn = document.getElementById("menuBtn");
  const sideNav = document.getElementById("sideNav");
  const menu = document.getElementById("menu");

  let menuOpen = false;

  if (menuBtn && sideNav && menu) {
    sideNav.style.right = "-250px";

    menuBtn.addEventListener("click", function () {
      if (!menuOpen) {
        sideNav.style.right = "0";
        menu.src = "images/close.png";
        menuOpen = true;
      } else {
        sideNav.style.right = "-250px";
        menu.src = "images/menuBtn.png";
        menuOpen = false;
      }
    });

    /*
      Close navigation automatically after
      clicking one of the navigation links.
    */

    const navLinks = sideNav.querySelectorAll('a[href^="#"]');

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        sideNav.style.right = "-250px";
        menu.src = "images/menuBtn.png";
        menuOpen = false;
      });
    });
  }


  /* =========================================================
     SMOOTH SCROLL
  ========================================================== */

  if (typeof SmoothScroll !== "undefined") {
    new SmoothScroll('a[href*="#"]', {
      speed: 900,
      speedAsDuration: true,
      offset: 0
    });
  }


  /* =========================================================
     EVENT DATE
     Prevent selecting dates in the past
  ========================================================== */

  const eventDate = document.getElementById("eventDate");

  if (eventDate) {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const todayFormatted = `${year}-${month}-${day}`;

    eventDate.setAttribute("min", todayFormatted);
  }


  /* =========================================================
     NUMBER OF PEOPLE
  ========================================================== */

  const decreasePeople = document.getElementById("decreasePeople");
  const increasePeople = document.getElementById("increasePeople");
  const peopleCount = document.getElementById("peopleCount");

  const MIN_PEOPLE = 1;
  const MAX_PEOPLE = 30;

  function updatePeopleCount(value) {
    if (!peopleCount) return;

    let number = parseInt(value, 10);

    if (isNaN(number)) {
      number = MIN_PEOPLE;
    }

    if (number < MIN_PEOPLE) {
      number = MIN_PEOPLE;
    }

    if (number > MAX_PEOPLE) {
      number = MAX_PEOPLE;
    }

    peopleCount.value = number;
  }


  if (decreasePeople && peopleCount) {
    decreasePeople.addEventListener("click", function () {
      const currentValue = parseInt(peopleCount.value, 10) || MIN_PEOPLE;

      updatePeopleCount(currentValue - 1);
    });
  }


  if (increasePeople && peopleCount) {
    increasePeople.addEventListener("click", function () {
      const currentValue = parseInt(peopleCount.value, 10) || MIN_PEOPLE;

      updatePeopleCount(currentValue + 1);
    });
  }


  /* =========================================================
     AUTOMATIC SERVICE SELECTION

     Example:
     Client clicks CHECK AVAILABILITY under
     Bridal Makeup Package.

     The form automatically selects:
     Bridal Makeup.
  ========================================================== */

  const serviceButtons = document.querySelectorAll(".service-inquiry-btn");
  const serviceNeeded = document.getElementById("serviceNeeded");

  serviceButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const selectedService = button.getAttribute("data-service");

      if (!serviceNeeded || !selectedService) return;

      const matchingOption = Array.from(serviceNeeded.options).find(
        function (option) {
          return option.value === selectedService;
        }
      );

      if (matchingOption) {
        serviceNeeded.value = selectedService;
      }
    });
  });


  /* =========================================================
     FORMSPREE FORM
  ========================================================== */

  const inquiryForm = document.getElementById("inquiryForm");
  const submitButton = document.getElementById("submitInquiry");
  const formStatus = document.getElementById("formStatus");

  /*
    Display a message under the form.
  */

  function showFormStatus(message, type) {
    if (!formStatus) return;

    formStatus.textContent = message;

    formStatus.className = "form-status";

    if (type === "success") {
      formStatus.classList.add("success");
    }

    if (type === "error") {
      formStatus.classList.add("error");
    }
  }


  /*
    Clear previous messages when the client
    starts editing the form again.
  */

  if (inquiryForm && formStatus) {
    inquiryForm.addEventListener("input", function () {
      if (
        formStatus.classList.contains("success") ||
        formStatus.classList.contains("error")
      ) {
        formStatus.textContent = "";
        formStatus.className = "form-status";
      }
    });
  }


  /* =========================================================
     FORM SUBMISSION
  ========================================================== */

  if (inquiryForm) {
    inquiryForm.addEventListener("submit", async function (event) {
      event.preventDefault();

      /*
        Let browser HTML validation handle
        required fields first.
      */

      if (!inquiryForm.checkValidity()) {
        inquiryForm.reportValidity();
        return;
      }


      const formAction = inquiryForm.getAttribute("action");


      /*
        IMPORTANT:
        We deliberately stop submission if the
        Irina Formspree ID has not yet been added.

        This prevents inquiries from being lost.
      */

      if (
        !formAction ||
        formAction.includes("YOUR_FORM_ID")
      ) {
        showFormStatus(
          "The inquiry form is not connected yet. Please email Irina directly at irinasariyevamakeup@gmail.com.",
          "error"
        );

        return;
      }


      /*
        Disable button while the form is sending.
      */

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }


      /*
        Clear old status.
      */

      if (formStatus) {
        formStatus.textContent = "";
        formStatus.className = "form-status";
      }


      try {
        const formData = new FormData(inquiryForm);

        const response = await fetch(formAction, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });


        /*
          Successful Formspree response
        */

        if (response.ok) {
          showFormStatus(
            "Thank you! Your inquiry has been sent. Irina will get back to you as soon as possible.",
            "success"
          );


          /*
            Clear form after successful submission.
          */

          inquiryForm.reset();


          /*
            Reset number of people.
          */

          if (peopleCount) {
            peopleCount.value = MIN_PEOPLE;
          }


          /*
            Scroll success message into view on
            smaller screens if necessary.
          */

          if (formStatus) {
            setTimeout(function () {
              formStatus.scrollIntoView({
                behavior: "smooth",
                block: "center"
              });
            }, 150);
          }
        } else {

          /*
            Attempt to retrieve Formspree error information.
          */

          let errorMessage =
            "Something went wrong while sending your inquiry. Please try again or email Irina directly at irinasariyevamakeup@gmail.com.";

          try {
            const data = await response.json();

            if (data.errors && data.errors.length > 0) {
              const formspreeErrors = data.errors
                .map(function (error) {
                  return error.message;
                })
                .join(" ");

              if (formspreeErrors) {
                console.error("Formspree:", formspreeErrors);
              }
            }
          } catch (jsonError) {
            console.error(
              "Could not read Formspree error response:",
              jsonError
            );
          }


          showFormStatus(errorMessage, "error");
        }
      } catch (error) {

        /*
          Network error / Formspree unavailable
        */

        console.error("Inquiry form error:", error);

        showFormStatus(
          "The inquiry could not be sent. Please check your internet connection or email Irina directly at irinasariyevamakeup@gmail.com.",
          "error"
        );
      } finally {

        /*
          Restore button.
        */

        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Send Inquiry";
        }
      }
    });
  }


  /* =========================================================
     CURRENT YEAR
     This also works if you later remove the
     small inline script from index.html.
  ========================================================== */

  const yearElement = document.getElementById("currentYear");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});
