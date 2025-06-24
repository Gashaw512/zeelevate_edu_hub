import { Link } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { founders } from "../../data/founders";
import styles from "./AboutUsBox.module.css";

const FounderCard = lazy(() => import("./FounderCard"));
const OrgStory = lazy(() => import("./OrgStory"));
const IntroVideo = lazy(() => import("./IntroVideo"));

const AboutUsBox = () => {
  const PROGRAMS_SECTION_ID = "service";

  return (
    <section className={styles.aboutUsSection}>
      <div className={styles.aboutUsContainer}>
        <h1 className={styles.sectionTitle}>Discover Zeelevate Academy</h1>
        <p className={styles.sectionDescription}>
          At Zeelevate, we're more than just an academy; we're a launchpad for
          digital empowerment. Our mission is to equip individuals with the
          essential skills to thrive in today's interconnected world.
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <div className={styles.sectionBlock}>
            <OrgStory />
          </div>

          <div className={styles.sectionBlock}>
            <h2 className={styles.subsectionHeading}>Experience Zeelevate in Action</h2>
            <IntroVideo />
          </div>
        </Suspense>

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
            The foundation of Zeelevate Academy lies in the passion and expertise of our founders.
          </p>
          <div className={styles.founderProfiles}>
            <Suspense fallback={<div>Loading team...</div>}>
              {founders.map((founder) => (
                <FounderCard
                  key={founder.name}
                  {...founder}
                  social={founder.social || {}}
                />
              ))}
            </Suspense>
          </div>
        </div>

        <div className={styles.whyChooseUsSection}>
          <h2 className={styles.whyChooseUsHeading}>Why Zeelevate is Your Best Choice</h2>
          <p className={styles.whyChooseUsDescription}>
            We stand out by providing a unique learning experience tailored for real-world impact.
          </p>

          <div className={styles.valuesGrid}>
            {[
              {
                icon: "🌟",
                title: "Unparalleled Expertise",
                text: "Learn from industry veterans and subject-matter experts who bring real-world insights.",
              },
              {
                icon: "💡",
                title: "Future-Proof Curriculum",
                text: "Courses are constantly updated to reflect latest industry trends.",
              },
              {
                icon: "🤝",
                title: "Supportive Community",
                text: "Connect with peers and mentors in a collaborative environment.",
              },
              {
                icon: "⏱️",
                title: "Flexible Learning Paths",
                text: "Learn at your own pace, accessible for both teens and adults.",
              },
              {
                icon: "🌍",
                title: "Globally Relevant Skills",
                text: "Acquire digital, financial, and soft skills for global industries.",
              },
              {
                icon: "🔑",
                title: "Certifications & Career Launch",
                text: "Earn certifications that accelerate your career.",
              },
            ].map((value, index) => (
              <div key={index} className={styles.valueItem}>
                <span className={styles.valueIcon}>{value.icon}</span>
                <h3 className={styles.valueTitle}>{value.title}</h3>
                <p className={styles.valueText}>{value.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(AboutUsBox);
