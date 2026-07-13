import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useProfile } from '../../context/ProfileContext';
import './StudentProfile.css';

/* ── Constants ─────────────────────────────────────────────── */
const CAREER_GOALS = [
  'Frontend Developer',
  'Backend Developer',
  'Full-Stack Developer',
  'AI Engineer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Cybersecurity Analyst',
  'Mobile App Developer',
  'Cloud Architect',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'college',
  'branch',
  'currentYear',
  'careerGoal',
  'dailyTime',
];

const INITIAL_FORM = {
  fullName: '',
  email: '',
  college: '',
  branch: '',
  currentYear: '',
  skills: '',
  careerGoal: '',
  dailyTime: '',
};

/* ── Helpers ────────────────────────────────────────────────── */
function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required.';

  if (!form.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.college.trim()) errors.college = 'College is required.';
  if (!form.branch.trim())  errors.branch  = 'Branch / Major is required.';
  if (!form.currentYear)    errors.currentYear = 'Please select your current year.';
  if (!form.careerGoal)     errors.careerGoal  = 'Please select a career goal.';
  if (!form.dailyTime)      errors.dailyTime   = 'Please select daily learning time.';

  return errors;
}

/* ── Component ──────────────────────────────────────────────── */
function StudentProfile({ onSubmit }) {
  const { loading, apiError, setProfile, setRoadmap } = useProfile();
  const [form, setForm]   = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  // File upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [savedResume, setSavedResume] = useState(null);

  /* Automatically load saved profile if available */
  useEffect(() => {
    const savedEmail = localStorage.getItem('learnmate_email');
    if (savedEmail) {
      axios.get(`/api/profiles?email=${encodeURIComponent(savedEmail)}`)
        .then((res) => {
          if (res.data.success && res.data.profiles && res.data.profiles.length > 0) {
            const profileData = res.data.profiles[0];
            setForm({
              fullName: profileData.name || '',
              email: profileData.email || '',
              college: profileData.college || '',
              branch: profileData.branch || '',
              currentYear: profileData.year || '',
              skills: profileData.skills ? profileData.skills.join(', ') : '',
              careerGoal: profileData.careerGoal || '',
              dailyTime: String(profileData.learningHours || ''),
            });
            if (profileData.resume) {
              setSavedResume(profileData.resume);
            }
            // Populate context
            setProfile(profileData);
            if (profileData.roadmap) {
              setRoadmap(profileData.roadmap);
            }
          }
        })
        .catch((err) => {
          console.warn('[Profile] Failed to fetch existing profile details:', err);
        });
    }
  }, [setProfile, setRoadmap]);

  /* Mark field as touched on blur */
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldErrors = validate({ ...form, [name]: form[name] });
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  /* Update form state */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    /* Clear error as user types */
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  /* Handle file select */
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowed = ['.pdf', '.doc', '.docx'];
      const fileName = file.name.toLowerCase();
      const isValid = allowed.some(ext => fileName.endsWith(ext));
      if (!isValid) {
        setErrors(prev => ({ ...prev, resume: 'Only PDF, DOC, and DOCX files are allowed.' }));
        setResumeFile(null);
      } else {
        setErrors(prev => ({ ...prev, resume: undefined }));
        setResumeFile(file);
      }
    }
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = REQUIRED_FIELDS.reduce(
      (acc, f) => ({ ...acc, [f]: true }),
      {}
    );
    setTouched(allTouched);

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    if (onSubmit) {
      await onSubmit({
        ...form,
        resumeFile,
      });
    }
  };

  /* ── Form ── */
  return (
    <section className="sp-wrapper" id="student-profile">
      <div className="sp-card">
        {/* Header */}
        <header className="sp-header">
          <span className="sp-header__icon" aria-hidden="true">🎓</span>
          <div>
            <h2 className="sp-header__title">Student Profile</h2>
            <p className="sp-header__subtitle">
              Tell us about yourself so we can craft your ideal learning path.
            </p>
          </div>
        </header>

        <form className="sp-form" onSubmit={handleSubmit} noValidate>
          {/* Row 1 — Full Name / Email */}
          <div className="sp-row">
            <Field
              label="Full Name"
              name="fullName"
              type="text"
              placeholder="e.g. Arjun Sharma"
              value={form.fullName}
              error={touched.fullName && errors.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <Field
              label="Email Address"
              name="email"
              type="email"
              placeholder="e.g. arjun@example.com"
              value={form.email}
              error={touched.email && errors.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
          </div>

          {/* Row 1.5 — Resume (Optional) */}
          <div className="sp-row">
            <div className="sp-field" />
            <div className={`sp-field ${errors.resume ? 'sp-field--error' : ''}`}>
              <label htmlFor="sp-resume" className="sp-field__label">
                Resume (Optional)
              </label>
              <input
                id="sp-resume"
                name="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="sp-field__input"
                style={{ padding: '0.55rem 0.95rem' }}
              />
              {resumeFile && (
                <p className="sp-field__hint">Selected file: <strong>{resumeFile.name}</strong></p>
              )}
              {savedResume && !resumeFile && (
                <p className="sp-field__hint" style={{ color: 'var(--color-accent)' }}>
                  📄 Current Resume: <strong>{savedResume.fileName}</strong> (Uploaded on {new Date(savedResume.uploadedAt).toLocaleDateString()})
                </p>
              )}
              {errors.resume && <p className="sp-field__error" role="alert">{errors.resume}</p>}
            </div>
          </div>

          {/* Row 2 — College / Branch */}
          <div className="sp-row">
            <Field
              label="College / University"
              name="college"
              type="text"
              placeholder="e.g. IIT Hyderabad"
              value={form.college}
              error={touched.college && errors.college}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            <Field
              label="Branch / Major"
              name="branch"
              type="text"
              placeholder="e.g. Computer Science"
              value={form.branch}
              error={touched.branch && errors.branch}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
          </div>

          {/* Row 3 — Year / Daily Time */}
          <div className="sp-row">
            <SelectField
              label="Current Year"
              name="currentYear"
              value={form.currentYear}
              error={touched.currentYear && errors.currentYear}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            >
              <option value="">— Select year —</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </SelectField>

            <SelectField
              label="Daily Learning Time (hours)"
              name="dailyTime"
              value={form.dailyTime}
              error={touched.dailyTime && errors.dailyTime}
              onChange={handleChange}
              onBlur={handleBlur}
              required
            >
              <option value="">— Select hours —</option>
              {Array.from({ length: 8 }, (_, i) => i + 1).map((h) => (
                <option key={h} value={h}>{h} hr{h > 1 ? 's' : ''} / day</option>
              ))}
            </SelectField>
          </div>

          {/* Row 4 — Career Goal (full width) */}
          <SelectField
            label="Career Goal"
            name="careerGoal"
            value={form.careerGoal}
            error={touched.careerGoal && errors.careerGoal}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          >
            <option value="">— Select your goal —</option>
            {CAREER_GOALS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </SelectField>

          {/* Row 5 — Skills */}
          <Field
            label="Current Skills"
            name="skills"
            type="text"
            placeholder="e.g. Python, HTML, CSS, SQL  (comma-separated)"
            value={form.skills}
            onChange={handleChange}
            onBlur={handleBlur}
            hint="Separate multiple skills with commas."
          />

          {/* API error */}
          {apiError && (
            <p className="sp-api-error" role="alert">{apiError}</p>
          )}

          {/* Submit */}
          <div className="sp-form__footer">
            <button
              type="submit"
              className="sp-btn sp-btn--primary"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <>
                  <span className="sp-btn__spinner" aria-hidden="true" /> Generating…
                </>
              ) : (
                <><span aria-hidden="true">🗺️</span> Generate Learning Roadmap</>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

/* ── Sub-components ─────────────────────────────────────────── */

function Field({ label, name, type, placeholder, value, error, hint, onChange, onBlur, required }) {
  const id = `sp-${name}`;
  return (
    <div className={`sp-field ${error ? 'sp-field--error' : ''}`}>
      <label htmlFor={id} className="sp-field__label">
        {label}{required && <span className="sp-field__req" aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className="sp-field__input"
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
        required={required}
      />
      {hint && !error && <p id={`${id}-hint`} className="sp-field__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="sp-field__error" role="alert">{error}</p>}
    </div>
  );
}

function SelectField({ label, name, value, error, children, onChange, onBlur, required }) {
  const id = `sp-${name}`;
  return (
    <div className={`sp-field ${error ? 'sp-field--error' : ''}`}>
      <label htmlFor={id} className="sp-field__label">
        {label}{required && <span className="sp-field__req" aria-hidden="true"> *</span>}
      </label>
      <div className="sp-field__select-wrap">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className="sp-field__select"
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={!!error}
          required={required}
        >
          {children}
        </select>
        <span className="sp-field__chevron" aria-hidden="true">▾</span>
      </div>
      {error && <p id={`${id}-error`} className="sp-field__error" role="alert">{error}</p>}
    </div>
  );
}

export default StudentProfile;
