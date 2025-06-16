import { Link } from "react-router-dom";
import FounderCard from "./FounderCard";
import OrgStory from "./OrgStory";
import IntroVideo from "./IntroVideo";
import { founders } from "../../data/founders";
import styles from "./AboutUsBox.module.css";

const AboutUsBox = () => {

    const PROGRAMS_SECTION_ID = 'service';
  return (
    <section className={styles.aboutUsSection}>
      <div className={styles.aboutUsContainer}>
   
        <h1 className={styles.sectionTitle}>Discover Zeelevate Academy</h1>
        <p className={styles.sectionDescription}>
          At Zeelevate, we're more than just an academy; we're a launchpad for digital empowerment.
          Our mission is to equip individuals with the essential skills to thrive in today's interconnected world,
          fostering a community of confident and capable digital citizens.
        </p>

      
        <div className={styles.sectionBlock}>
          <OrgStory />
        </div>

       
        <div className={styles.sectionBlock}>
          <h2 className={styles.subsectionHeading}>Experience Zeelevate in Action</h2>
          <IntroVideo />
        </div>
      
        <div className={styles.aboutSectionCta}>
          <h2 className={styles.ctaHeadingSmall}>Ready to Elevate Your Skills?</h2>
          <Link
  to="/"
  state={{ scrollTo: PROGRAMS_SECTION_ID }}
  className="cta-button primary-cta-button"
>
  Explore Our Programs
</Link>

        </div>

     
        <div className={styles.sectionBlock}>
          <h2 className={styles.subsectionHeading}>Meet Our Visionary Founders</h2>
          <p className={styles.sectionDescription}>
            The foundation of Zeelevate Academy lies in the passion and expertise of our founders,
            dedicated to empowering the next generation of digital leaders.
          </p>
          <div className={styles.founderProfiles}>
            {founders.map((founder) => (
              <FounderCard
                key={founder.name}
           
                {...{ ...founder, social: founder.social || {} }}
              />
            ))}
          </div>
        </div>


        <div className={styles.whyChooseUsSection}>
          <h2 className={styles.whyChooseUsHeading}>Why Zeelevate is Your Best Choice</h2>
          <p className={styles.whyChooseUsDescription}>
            We stand out by providing a unique learning experience tailored for real-world impact.
          </p>
          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon}>🌟</span>
              <h3 className={styles.valueTitle}>Unparalleled Expertise</h3>
              <p className={styles.valueText}>
                Learn from industry veterans and subject-matter experts who bring real-world insights directly to your lessons.
              </p>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon}>💡</span>
              <h3 className={styles.valueTitle}>Future-Proof Curriculum</h3>
              <p className={styles.valueText}>
                Our dynamic courses are constantly updated to reflect the latest industry trends and technological advancements.
              </p>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon}>🤝</span>
              <h3 className={styles.valueTitle}>Supportive Community</h3>
              <p className={styles.valueText}>
                Connect with peers and mentors in an active, collaborative environment designed to foster mutual growth.
              </p>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon}>⏱️</span>
              <h3 className={styles.valueTitle}>Flexible Learning Paths</h3>
              <p className={styles.valueText}>
                Study at your own pace, on your schedule, with accessible content tailored for both teens and adults.
              </p>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon}>🌍</span>
              <h3 className={styles.valueTitle}>Globally Relevant Skills</h3>
              <p className={styles.valueText}>
                Acquire digital, financial, and soft skills that are highly valued and applicable across diverse global industries.
              </p>
            </div>
            <div className={styles.valueItem}>
              <span className={styles.valueIcon}>🔑</span>
              <h3 className={styles.valueTitle}>Certifications & Career Launch</h3>
              <p className={styles.valueText}>
                Earn recognized certifications that open doors to new opportunities and accelerate your professional journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsBox;