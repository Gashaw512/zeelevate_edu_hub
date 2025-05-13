import "./Facilities.css";
const network = "/images/network.png";
const laptop = "/images/laptop.jpg";

const Facilities = () => {
  return (
    <section className="facilities">
      <div className="facilities-header">
        <h2>Our Facilities</h2>
        <p>
          Discover the resources and environment Zeelevate provides to empower your
          learning journey.
        </p>
      </div>
      <div className="facilities-grid">
        <div className="facilities-col">
          <img src="/images/library.png" alt="World Class Learning Resources" />
          <h3>World-Class Learning Resources</h3>
          <p className="facilities-text">
            Access a wealth of knowledge and materials to support your growth in digital
            and financial literacy, and programming.
          </p>
        </div>
        <div className="facilities-col">
          <img src={network} alt="Engaging Community Forums" />
          <h3>Engaging Community Forums</h3>
          <p className="facilities-text">
            Connect with peers and instructors in our interactive forums, fostering collaboration
            and a supportive learning community.
          </p>
        </div>
        <div className="facilities-col">
          <img src={laptop} alt="Flexible Online Access" />
          <h3>Flexible Online Access</h3>
          <p className="facilities-text">
            Learn at your convenience with our accessible online platform, designed for
            flexible learning anytime, anywhere.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Facilities;