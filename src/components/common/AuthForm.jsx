import PropTypes from 'prop-types';

const AuthForm = ({ 
  formData, 
  onSubmit, 
  onChange, 
  submitButtonText = 'Submit',
  disabled = false,
  // additionalFields,
  children 
}) => {
  return (
    <form onSubmit={onSubmit} className="form-container">
      {Object.entries(formData).map(([name, value]) => (
        <div key={name} className="input-container">
          <input
            type={name === 'password' ? 'password' : 'text'}
            name={name}
            placeholder={
              name === 'email' ? 'you@example.com' : 
              name === 'password' ? '••••••••' : 
              `Enter your ${name}`
            }
            value={value}
            onChange={onChange}
            required
            className="input"
            disabled={disabled}
          />
        </div>
      ))}

          {/* ✅ Inject additional fields here */}
          {/* {additionalFields} */}

      <button 
        type="submit" 
        className="button primary-button"
        disabled={disabled}
      >
        {submitButtonText}
      </button>
      {children}
    </form>
  );
};

export default AuthForm;


// Define the prop types for the AuthForm component
AuthForm.propTypes = {
  formData: PropTypes.object.isRequired, // Expect an object for formData
  onSubmit: PropTypes.func.isRequired,   // Expect a function for onSubmit
  onChange: PropTypes.func.isRequired,   // Expect a function for onChange
  submitButtonText: PropTypes.string,    // Expect a string for the button text (optional)
  disabled: PropTypes.bool,            // Expect a boolean for the disabled state (optional)
  children: PropTypes.node,            // Expect renderable nodes for children (optional)
};
