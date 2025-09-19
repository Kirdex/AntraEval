const Api = (() => {
  const url = "http://localhost:4232/courseList";
  const classPromise = fetch(url).then((res) => {
    return res.json();
  });
  return {
    classPromise,
  };
})();

const View = (() => {
  const dom = {
    container: document.querySelector("#availableCourseList"),
    items: document.querySelector("#courseList"),
    btn: document.querySelector("#select-btn"),
    credit: document.querySelector("#creditDisplay"),
    selected_container: document.querySelector("#selectedCourseList"),
  };
  const createTmp = (dataList) => {
    let template = "";

    dataList.forEach((course) => {
      template += `<li><div>${course.courseName}</div> <div> Course type: ${
        course.required ? "Compulsory" : "Elective"
      }</div> <div>Course credit: ${course.credit}</div></li>`;
    });

    return template;
  };

  const render = (elem, template) => {
    if (elem) {
      elem.innerHTML = template;
    } else {
      console.error("Container element not found");
    }
  };

  const renderSelected = (selectedCourse) => {
    const selectedContainer = dom.selected_container;
    const template = createTmp(selectedCourse);
    render(selectedContainer, template);
  };

  const showConfirmation = (totalCredits) => {
    const confirmMessage = `You have chosen ${totalCredits} total credits. Do you want to move all selected courses to the Selected Courses bucket?`;
    return confirm(confirmMessage);
  };
  const updateCreditDisplay = (creditValue) => {
    const display = dom.credit;
    if (display) {
      display.textContent = creditValue;
    }
  };
  return {
    createTmp,
    render,
    dom,
    updateCreditDisplay,
    showConfirmation,
  };
})();

const Model = ((view, api) => {
  const { createTmp, render, dom } = view;
  const { classPromise } = api;
  class Course {
    #courseList;
    constructor() {
      this.#courseList = [];
    }

    set newCourse(newCourse) {
      this.#courseList = newCourse;
      const template = createTmp(this.#courseList);
      render(dom.container, template);
    }

    get courseInfo() {
      return this.#courseList;
    }
  }
  return {
    Course,
    classPromise,
  };
})(View, Api);

const Controller = ((view, model) => {
  const { Course, classPromise } = model;
  const courseList = new Course();
  const selectedCourse = [];
  const { dom } = view;
  let currentCredit = 0; // Changed from const to let
  const init = () => {
    classPromise.then((list) => {
      courseList.newCourse = list;
    });
  };

  const select = () => {
    dom.container.addEventListener("click", (event) => {
      if (event.target.closest("li")) {
        const li = event.target.closest("li");
        const listItems = dom.container.querySelectorAll("li");

        if (li.classList.contains("active")) {
          li.classList.remove("active");

          const courseIndex = Array.from(listItems).indexOf(li);
          const courseData = courseList.courseInfo[courseIndex];
          const selectedIndex = selectedCourse.findIndex(
            (course) => course.courseName === courseData.courseName
          );
          if (selectedIndex > -1) {
            selectedCourse.splice(selectedIndex, 1);
            currentCredit = countCredit(
              currentCredit,
              subtract,
              courseData.credit
            );
            console.log("Current Credit:", currentCredit);
            view.updateCreditDisplay(currentCredit);
          }
        } else {
          li.classList.add("active");
          const courseIndex = Array.from(listItems).indexOf(li);
          const courseData = courseList.courseInfo[courseIndex];
          selectedCourse.push(courseData);
          currentCredit = countCredit(currentCredit, add, courseData.credit);
          view.updateCreditDisplay(currentCredit);
          console.log("Current Credit:", currentCredit);
        }
      }
    });
  };
  const countCredit = (currentCredit, operation, credit) => {
    return (currentCredit = operation(currentCredit, credit));
  };

  const add = (currentCredit, credit) => {
    return currentCredit + credit;
  };

  const subtract = (currentCredit, credit) => {
    return currentCredit - credit;
  };

  const AddCourse = () => {
    dom.btn.addEventListener("click", () => {
      if (currentCredit === 0) {
        alert("Please select at least one course to proceed.");
      } else if (moreEighteenCredit) {
        alert("You can only choose up to 18 credits in one semester");
      } else {
        const userConfirmed = view.showConfirmation(currentCredit);

        if (userConfirmed) {
        }
      }
    });
  };
  const moreEighteenCredit = () => {
    if (currentCredit > 18) {
      alert("You can only choose up to 18 credits in one semester");
      return true;
    }
    return false;
  };
  const bootstrap = () => {
    init();
    select();
    updateCreditDisplay();
    moreEighteenCredit();
    AddCourse();
  };

  return { bootstrap };
})(View, Model);

Controller.bootstrap();
