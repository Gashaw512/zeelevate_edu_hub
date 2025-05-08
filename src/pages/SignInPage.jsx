import Subheader from "../components/Subheader/Subheader";
import SignIn from "../components/auth/signin/SignIn";
import Footer from "../components/Footer/Footer";

const SignInPage = () => {
  return (
    <>
      <Subheader header="About Us" />
      <SignIn />
      <Footer />
    </>
  );
};

export default SignInPage;
