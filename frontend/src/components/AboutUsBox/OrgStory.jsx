import styles from './OrgStory.module.css';

const OrgStory = () => (
  <div className={styles.orgStory}>
    <h2 className={styles.orgStoryTitle}>Our Story & Vision</h2>
    <p className={styles.orgStoryText}>
      Zeelevate was founded in 2023 with a mission to close the digital divide by equipping teens, adults, and parents with essential 21st-century skills. Our platform merges coding, financial literacy, and life skills to prepare learners for a digitally driven future.
    </p>
    <ul className={styles.specializations}>
      <li>Python Programming & Web Development</li>
      <li>Financial Literacy for Everyday Life</li>
      <li>College Preparation & Planning Workshops</li>
      <li>Digital Citizenship & Online Safety</li>
    </ul>
  </div>
);

export default OrgStory;