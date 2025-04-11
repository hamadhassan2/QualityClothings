import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Title from '../components/Title';
import { assets } from '../assets/frontend_assets/assets';
import { MutatingDots } from "react-loader-spinner";

const About = () => {
  const [faqOpen, setFaqOpen] = useState(null);
  const [showAnimation, setShowAnimation] = useState(true);

  const faqs = [
    { question: 'How can I track my order?', answer: 'You can track your order in the "My Orders" section of your account or via the tracking link sent to your email.' },
    { question: 'What is your return policy?', answer: 'We offer a 30-day hassle-free return policy. If you are not satisfied with your purchase, you can return it within this period.' },
    { question: 'Are my payments secure?', answer: 'Yes, we use industry-standard encryption to ensure all transactions are safe and secure.' },
    { question: 'How can I contact customer support?', answer: 'Our customer support team is available 24/7. You can reach us via chat, email, or phone.' }
  ];

  // Variants for sections with a smooth, attractive transition.
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  if (showAnimation) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <MutatingDots
          height="120"
          width="120"
          color="#32cd32"
          secondaryColor="#2ecc71"
          radius="12.5"
          ariaLabel="mutating-dots-loading"
          visible={true}
        />
      </div>
    );
  }

  return (
    <div className='px-6 md:px-12 lg:px-20 xl:px-32 py-10 border-t'>
      
      {/* ABOUT US Section */}
      <motion.div 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className='text-2xl text-center pt-8'
      >
        <Title text1={'ABOUT'} text2={'US'} />
      </motion.div>
      <motion.div 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className='my-10 flex flex-col md:flex-row items-center gap-10 md:gap-16'
      >
        <motion.img 
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className='w-full md:max-w-[450px] rounded-lg shadow-lg'
          src={assets.about_img}
          alt='About Us'
        />
        <motion.div 
          variants={sectionVariants}
          className='flex flex-col justify-center gap-6 md:w-2/4 text-gray-600 text-lg leading-relaxed'
        >
          <p>
            QualityClothings was born out of a passion for innovation and a desire to revolutionize the way people shop online. Our journey began with a simple idea: to provide a platform where customers can easily discover, explore, and purchase a wide range of products from the comfort of their homes.
          </p>
          <p>
            Since our inception, we've worked tirelessly to curate a diverse selection of high-quality products that cater to every taste and preference.
          </p>
          <b className='text-gray-800 text-xl'>Our Mission</b>
          <p>
            Our mission at QualityClothings is to empower customers with choice, convenience, and confidence. We're dedicated to providing a seamless shopping experience that exceeds expectations, from browsing and ordering to delivery and beyond.
          </p>
         
         
        </motion.div>
      </motion.div>

      {/* WHY CHOOSE US Section */}
      <motion.div 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className='text-xl py-4 text-center'
      >
        <Title text1={'WHY'} text2={'CHOOSE US'} />
      </motion.div>
      <motion.div 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-center'
      >
        {[
          {
            title: "High-Quality Products",
            text: "We offer a diverse range of top-tier products from trusted brands."
          },
          {
            title: "Seamless Shopping",
            text: "Enjoy an intuitive and hassle-free shopping experience."
          },
          {
            title: "Customer-Centric Approach",
            text: "Our customers are our priority, ensuring satisfaction every step of the way."
          },
        
        ].map((item, index) => (
          <motion.div 
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className='p-6 border rounded-lg shadow-md hover:shadow-lg transition-all duration-300'
          >
            <h3 className='text-gray-800 text-lg font-semibold'>{item.title}</h3>
            <p className='text-gray-600 mt-2'>{item.text}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className='text-xl py-10 text-center'
      >
        <Title text1={'FREQUENTLY ASKED'} text2={'QUESTIONS'} />
      </motion.div>
      <motion.div 
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className='max-w-2xl mx-auto'
      >
        {faqs.map((faq, index) => (
          <motion.div 
            key={index}
            whileHover={{ backgroundColor: "#f9fafb" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className='border-b py-4 cursor-pointer'
            onClick={() => setFaqOpen(faqOpen === index ? null : index)}
          >
            <h4 className='text-gray-800 text-lg font-semibold flex justify-between'>
              {faq.question}
              <span>{faqOpen === index ? '-' : '+'}</span>
            </h4>
            {faqOpen === index && <p className='text-gray-600 mt-2'>{faq.answer}</p>}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default About;
