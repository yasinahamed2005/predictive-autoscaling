import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="pt-32 pb-20 px-6 min-h-screen">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        About <span className="text-gradient-brand">FreshGrocer</span>
                    </h1>
                    <p className="text-xl text-ink/60 dark:text-paper/60">
                        We are on a mission to make healthy, organic food accessible to everyone.
                    </p>
                </motion.div>

                <div className="space-y-12 text-ink/70 dark:text-paper/70 leading-relaxed">
                    {/* Developer Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="bg-gradient-to-br from-white/10 to-white/5 p-8 rounded-2xl border border-ink/10 dark:border-paper/10 text-center relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <h2 className="text-3xl font-bold text-ink dark:text-paper mb-2 relative z-10">Meet the Developer</h2>
                        <div className="w-24 h-1 bg-brand-500 mx-auto mb-6 rounded-full" />

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-brand-500 mb-2">Bhanu Kamal</h3>
                            <p className="text-ink/60 dark:text-paper/60 mb-6">Full Stack Developer & UI/UX Enthusiast</p>
                            <p className="max-w-2xl mx-auto text-ink/70 dark:text-paper/70">
                                Passionate about building beautiful, functional, and user-centric web applications.
                                This project demonstrates the power of modern web technologies to create seamless e-commerce experiences.
                            </p>
                        </div>
                    </motion.section>

                    {/* Tech Stack Section */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-center text-ink dark:text-paper mb-8">Built With</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {[
                                { name: 'React', desc: 'UI Library' },
                                { name: 'Vite', desc: 'Build Tool' },
                                { name: 'Tailwind CSS', desc: 'Styling' },
                                { name: 'Framer Motion', desc: 'Animations' },
                                { name: 'React Router', desc: 'Navigation' },
                                { name: 'Lucide React', desc: 'Icons' }
                            ].map((tech, index) => (
                                <motion.div
                                    key={tech.name}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                                    className="bg-ink/[0.03] dark:bg-paper/5 p-6 rounded-xl border border-ink/5 dark:border-paper/5 text-center cursor-default transition-colors"
                                >
                                    <h3 className="text-xl font-bold text-brand-500 mb-1">{tech.name}</h3>
                                    <p className="text-sm text-ink/60 dark:text-paper/60">{tech.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                </div>
            </div>
        </div>
    );
};

export default About;
