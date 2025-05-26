import  { useState, useEffect } from "react"; // If you plan to fetch data
import Subheader from "../components/Subheader/Subheader";
import Courses from "../components/Courses/Courses";
import Facilities from "../components/Facilities/Facilities";
import Footer from "../components/Footer/Footer";
import { useLocation } from "react-router-dom"; // To get query parameters
import { audienceTitles } from "../data/courseConstants";

const Course = () => {
  const location = useLocation();
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [title, setTitle] = useState("Our Courses");
  const [subtitle, setSubtitle] = useState("Explore our range of empowering courses.");

    // Replace this dummy data with your actual course data fetching logic
    const allCourses = [
      
      {
        id: 101,
        icon: <i className="fas fa-code" />,
        title: "Python for Teens: Coding Fundamentals",
        description: "Get started with Python! Learn the basics of programming, including variables, loops, and functions. Create your own simple games and applications.",
        price: 49,
        duration: "8 weeks",
        prerequisites: "None",
        learningOutcomes: [
          "Understand basic programming concepts",
          "Write and execute Python code",
          "Use control structures (loops, conditionals)",
          "Create simple programs and games"
        ]
      },
      {
        id: 102,
        icon: <i className="fas fa-globe" />,
        title: "Digital Citizenship for Teens",
        description: "Become a responsible digital citizen! Learn how to stay safe online, protect your privacy, and engage positively in online communities.",
        price: 29,
        duration: "4 weeks",
        prerequisites: "Basic internet skills",
        learningOutcomes: [
          "Identify and avoid online risks",
          "Practice ethical online behavior",
          "Protect personal information online",
          "Evaluate online sources critically"
        ]
      },
      {
        id: 201,
        icon: <i className="fas fa-money-bill" />,
        title: "Financial Literacy for Adults: Budgeting and Saving",
        description: "Take control of your finances! Learn how to budget effectively, save money, and make informed financial decisions.",
        price: 39,
        duration: "6 weeks",
        prerequisites: "None",
        learningOutcomes: [
          "Create and manage a personal budget",
          "Understand different types of savings accounts",
          "Set financial goals",
          "Develop healthy spending habits"
        ]
      },
      {
        id: 202,
        icon: <i className="fas fa-graduation-cap" />,
        title: "College Prep for Adults: Application Essentials",
        description: "Prepare for your college journey! Get guidance on the application process, writing personal essays, and securing financial aid.",
        price: 59,
        duration: "10 weeks",
        prerequisites: "High school diploma or equivalent",
        learningOutcomes: [
          "Complete college applications effectively",
          "Write a compelling personal essay",
          "Understand the college admissions process",
          "Explore financial aid and scholarship options"
        ]
      },
      {
        id: 203,
        icon: <i className="fas fa-shield-alt" />,
        title: "Cybersecurity Fundamentals for Adults",
        description: "Protect yourself in the digital world! Learn essential cybersecurity practices to keep your data and devices safe from threats.",
        price: 49,
        duration: "6 weeks",
        prerequisites: "Basic computer skills",
        learningOutcomes: [
          "Identify common cyber threats (phishing, malware)",
          "Create strong passwords and practice safe browsing",
          "Protect personal data and privacy online",
          "Secure home networks and devices"
        ]
      },
      {
        id: 103,
        icon: <i className="fas fa-calculator" />,
        title: "Financial Planning for Teens",
        description: "Start building a strong financial future! Learn the basics of saving, budgeting, and making smart money choices.",
        price: 29,
        duration: "4 weeks",
        prerequisites: "None",
        learningOutcomes: [
          "Create a simple budget",
          "Understand the importance of saving",
          "Differentiate between needs and wants",
          "Make informed spending decisions"
        ]
      },
      {
        id: 104,
        icon: <i className="fas fa-laptop" />,
        title: "Web Design for Teens: HTML & CSS",
        description: "Build your own websites! Learn the fundamentals of HTML and CSS to create and style web pages.",
        price: 59,
        duration: "10 weeks",
        prerequisites: "Basic computer skills",
        learningOutcomes: [
          "Understand the structure of a web page (HTML)",
          "Style web pages with CSS",
          "Create basic website layouts",
          "Use images and links effectively"
        ]
      }
    ];

  // Function to filter courses based on audience
  const filterCoursesByAudience = (audience) => {
    if (audience === "teen") {
      const teenCourses = allCourses.filter(course => course.title.includes("Teens"));
      setFilteredCourses(teenCourses);
      setTitle(audienceTitles.teen.title);
      setSubtitle(audienceTitles.teen.subtitle);
    } else if (audience === "adult") {
      const adultCourses = allCourses.filter(course => course.title.includes("Adults"));
      setFilteredCourses(adultCourses);
      setTitle(audienceTitles.adult.title);
      setSubtitle(audienceTitles.adult.subtitle);
    } else {
      setFilteredCourses(allCourses);
      setTitle(audienceTitles.default.title);
      setSubtitle(audienceTitles.default.subtitle);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const audience = params.get("audience");
    filterCoursesByAudience(audience); // Call the filtering function
  }, [location.search]);

  return (
    <>
      <Subheader header={title} />
      <Courses courses={filteredCourses} />
      <Facilities /> {/* Consider the purpose of this component */}
      {/* <Footer /> */}
    </>
  );
};

export default Course;