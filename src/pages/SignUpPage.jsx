import Subheader from "../components/Subheader/Subheader";
// import SignUp from "../components/auth/SignUp";
import SignUp from "../components/auth/signup/SignUp";
import Footer from "../components/Footer/Footer";

const SignUpPage = () => {
  return (
    <>
      <Subheader header="About Us" />
      <SignUp />
      <Footer />
    </>
  );
};

export default SignUpPage;
