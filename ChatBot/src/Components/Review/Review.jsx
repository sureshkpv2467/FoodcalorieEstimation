import React from 'react';
import './Review.css';
import profile1 from '../../assets/images/profiles/profile1.jpg';
import profile2 from '../../assets/images/profiles/profile2.jpg';
import profile3 from '../../assets/images/profiles/profile3.jpg';
import profile4 from '../../assets/images/profiles/profile4.jpg';

const testimonials = [
  {
    name: 'John Doe',
    title: 'Fitness Enthusiast',
    text: 'I have been using this platform for a few weeks now, and it has completely changed the way I approach my diet. The personalized recommendations have helped me stay on track with my fitness goals.',
    img: profile1,
  },
  {
    name: 'Jane Smith',
    title: 'Nutritionist',
    text: 'As a nutritionist, I highly recommend this platform to all my clients. It provides accurate food identification and nutritional information, making it easier for individuals to make informed choices about their diet.',
    img: profile2,
  },
  {
    name: 'David Lee',
    title: 'Personal Trainer',
    text: 'I incorporate this platform into my training programs to help clients understand the importance of nutrition. The detailed reports generated based on their health details and food choices are invaluable..............................................',
    img: profile3,
  },
  {
    name: 'Sarah Johnson',
    title: 'Health Coach',
    text: 'This platform is a game-changer for promoting healthy eating habits. The AI analysis combined with personalized suggestions ensures that individuals can make positive changes to their diet and overall well-being.',
    img: profile4,
  },
];

const Testimonials = () => {
  return (
    <div className="review-section">
      <div className="review-heading">
        <h2>Testimonials</h2>
      </div>
      <section className="testimonials">
        {testimonials.map((t, index) => (
          <div key={index} className="testimonial-wrapper">
            <div className="testimonial-bg" />
            <div className="testimonial-card">
              <div className="testimonial-content">
                <img src={t.img} alt={t.name} className="testimonial-img" />
                <div>
                  <h3>{t.name}</h3>
                  <p className="testimonial-role">{t.title}</p>
                </div>
              </div>
              <p className="testimonial-text">{t.text}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Testimonials;
