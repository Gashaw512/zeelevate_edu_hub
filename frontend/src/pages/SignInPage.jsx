import Subheader from "../components/Subheader/Subheader";
import SignIn from "../components/auth/signIn/SignIn";
import Footer from "../components/Footer/Footer";

const SignInPage = () => {
  return (
    <>
      <Subheader header="Well Come to Zeelevate" /> 
      <SignIn />
      {/* <AuthLayout/> */}
      <Footer />
    </>
  );
};

export default SignInPage;
