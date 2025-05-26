import Header from "../components/Header/Header";
import Course from "./Course"
import Facilities from "../components/Facilities/Facilities";
import Cta from "../components/Cta/Cta";
import Testimonials from "../components/Testimonials/Testimonials";
import Footer from "../components/Footer/Footer";

const Home = () => {
  return (
    <>
      <Header />
      <Course />
      <Facilities />
      <Cta />
      <Testimonials />
      <Footer />
    </>
  );
};

export default Home;
