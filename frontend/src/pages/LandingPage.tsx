import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Cpu, Zap, Activity, MessageSquare, Database, ArrowUpRight, HelpCircle, Star } from 'lucide-react';
import { CanvasHero3D } from '../components/CanvasHero3D';
import { WorkflowBuilder } from '../components/WorkflowBuilder';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const LandingPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // GSAP animations on load
  useEffect(() => {
    // 1. Hero Timeline
    const tl = gsap.timeline();
    tl.fromTo('.hero-badge', 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    )
    .fromTo('.hero-title-word',
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.15, duration: 0.8, ease: 'power4.out' },
      '-=0.3'
    )
    .fromTo('.hero-desc',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
      '-=0.4'
    )
    .fromTo('.hero-cta',
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' },
      '-=0.3'
    );

    // 2. Stats Counting Animation on scroll
    const statsElements = document.querySelectorAll('.stat-count');
    statsElements.forEach((stat) => {
      const targetVal = parseInt(stat.getAttribute('data-target') || '0');
      const counter = { val: 0 };
      
      gsap.to(counter, {
        val: targetVal,
        duration: 2.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: stat,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        onUpdate: () => {
          // Format with + or % based on attributes
          const prefix = stat.getAttribute('data-prefix') || '';
          const suffix = stat.getAttribute('data-suffix') || '';
          stat.innerHTML = `${prefix}${Math.floor(counter.val).toLocaleString()}${suffix}`;
        }
      });
    });

    // 3. Staggered reveal for feature cards
    gsap.fromTo('.feature-card-gsap',
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: '.features-grid-gsap',
          start: 'top 80%'
        }
      }
    );

    // 4. Parallax effect for cards tilt
    const cards = document.querySelectorAll('.tilt-card-gsap');
    cards.forEach((card) => {
      const handleMouseMove = (e: Event) => {
        const mouseEvent = e as MouseEvent;
        const rect = (card as HTMLElement).getBoundingClientRect();
        const x = mouseEvent.clientX - rect.left;
        const y = mouseEvent.clientY - rect.top;
        
        const xc = rect.width / 2;
        const yc = rect.height / 2;
        
        const angleX = (yc - y) / 15;
        const angleY = (x - xc) / 15;

        gsap.to(card, {
          transform: `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.02)`,
          duration: 0.3,
          ease: 'power2.out'
        });
      };

      const handleMouseLeave = () => {
        gsap.to(card, {
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)',
          duration: 0.5,
          ease: 'power2.out'
        });
      };

      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
      
      return () => {
        card.removeEventListener('mousemove', handleMouseMove);
        card.removeEventListener('mouseleave', handleMouseLeave);
      };
    });

  }, []);

  const features = [
    {
      icon: Cpu,
      title: 'Automated AI Agents',
      desc: 'Orchestrate GPT-4, Claude 3.5, and Llama instances to process incoming hooks, synthesize responses, and filter fields.'
    },
    {
      icon: Zap,
      title: 'Instant Webhooks',
      desc: 'Receive triggers from GitHub, Stripe, Slack, or databases. Spin up API routing end-points in less than 200ms.'
    },
    {
      icon: Shield,
      title: 'API Key Access Control',
      desc: 'Deliver production-grade authorization keys to external developers with custom prefixes and scopes (SHA-256 hashed).'
    },
    {
      icon: Activity,
      title: 'Real-time Telemetry',
      desc: 'Inspect nodes logs, workflow latency charts, CPU run metrics, and status traces in a premium console interface.'
    },
    {
      icon: Database,
      title: 'Zero-Config Database',
      desc: 'Persist outputs, cache variables, and map edges outputs straight to our dynamic MySQL/SQLite cluster.'
    },
    {
      icon: MessageSquare,
      title: 'Notification Alert Hub',
      desc: 'Distribute workspace alerts to your email, Slack channels, or dashboard message panels instantly.'
    }
  ];

  const pricingTiers = [
    {
      name: 'Developer',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for prototyping automated scripts.',
      features: [
        '5 Active Workflows',
        '100 Runs / Month',
        'SQLite In-Memory Sync',
        'Standard Email OTP'
      ],
      cta: 'Start Free',
      isPopular: false
    },
    {
      name: 'Professional',
      price: '$49',
      period: 'per month',
      desc: 'Unlocks advanced AI execution nodes.',
      features: [
        'Unlimited Active Workflows',
        '10,000 Runs / Month',
        'Custom Webhooks & REST Keys',
        'GPT-4 AI Smart Nodes',
        '24/7 Priority Support'
      ],
      cta: 'Start 14-Day Free Trial',
      isPopular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'tailored plans',
      desc: 'Custom security compliance, SSO & dedicated servers.',
      features: [
        'Dedicated MySQL Node Pool',
        'SLA Response Guarantee',
        'Bespoke SSH Tunnels',
        'Advanced IAM & Multi-tenant'
      ],
      cta: 'Contact Sales',
      isPopular: false
    }
  ];

  const FAQs = [
    {
      q: 'How does the Visual Workflow Builder work?',
      a: 'The builder allows you to coordinate logic blocks (nodes) by drawing paths (edges). When an event hits the trigger node (such as a POST request or scheduled interval), the data flows sequentially through your action and condition nodes.'
    },
    {
      q: 'Can I connect my own custom APIs?',
      a: 'Absolutely. You can generate API credentials inside the dashboard console, and then make requests to trigger workflows, or invoke external servers directly using our HTTP webhook nodes.'
    },
    {
      q: 'Are my workflow parameters secure?',
      a: 'Yes. All secrets, environmental variables, and keys are fully encrypted. API keys are hashed with SHA-256 before database insertion, meaning they are never readable in plain text.'
    },
    {
      q: 'Is there support for MySQL databases?',
      a: 'Yes. The backend fully maps to MySQL using Knex and pool connections. For local runs and developer onboarding, we ship an automatic SQLite database fallback.'
    }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. HERO SECTION */}
      <section ref={heroRef} className="relative w-full min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center pt-20 overflow-hidden">
        
        {/* Three.js Canvas Backdrop */}
        <CanvasHero3D />

        <div className="max-w-4xl z-10 select-none">
          
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-bold tracking-wider text-zinc-300 uppercase">
              Now in Public Beta
            </span>
          </div>

          {/* Heading */}
          <h1 ref={titleRef} className="font-display font-black text-4xl sm:text-6xl lg:text-7.5xl text-zinc-900 dark:text-white leading-[1.1] tracking-tight">
            <span className="hero-title-word block">Orchestrate Visual</span>
            <span className="hero-title-word block bg-gradient-to-r from-violet-600 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              Workflows with AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-desc mt-6 max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
            Nexus AI connects your apps, executes deep LLM processing, and triggers serverless automations. Build robust, Apple-level workflows in a beautiful node editor.
          </p>

          {/* Call-to-actions */}
          <div className="hero-cta mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm rounded-full shadow-glow hover:shadow-glow-strong hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Start Building Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/docs"
              className="px-6 py-3 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-800 font-bold text-sm rounded-full transition-all"
            >
              Read Documentation
            </Link>
          </div>

        </div>

      </section>

      {/* 2. STATS SECTION */}
      <section ref={statsRef} className="w-full bg-zinc-950 border-y border-zinc-900 py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            
            <div className="flex flex-col items-center">
              <span className="stat-count font-display font-black text-4xl sm:text-5xl text-white" data-target="99" data-suffix=".9%">
                0%
              </span>
              <span className="mt-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Uptime SLA
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="stat-count font-display font-black text-4xl sm:text-5xl text-white" data-target="150" data-prefix="+" data-suffix="M">
                0M
              </span>
              <span className="mt-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Operations Automated
              </span>
            </div>

            <div className="flex flex-col items-center">
              <span className="stat-count font-display font-black text-4xl sm:text-5xl text-white" data-target="200" data-suffix="ms">
                0ms
              </span>
              <span className="mt-2 text-xs font-semibold text-zinc-500 uppercase tracking-widest">
                Avg Node Execution
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 3. LOGOS MARQUEE */}
      <section className="w-full py-8 z-10 overflow-hidden relative border-b border-zinc-100 dark:border-zinc-900">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
        
        {/* Infinite Logo Slider */}
        <div className="flex w-[200%] gap-12 items-center animate-grid-slide py-2">
          {Array(2).fill(0).map((_, groupIdx) => (
            <div key={groupIdx} className="flex flex-grow justify-around items-center min-w-full gap-8">
              {['Vercel', 'Linear', 'Stripe', 'Framer', 'Supabase', 'OpenAI'].map((logo, i) => (
                <div key={i} className="text-sm font-display font-extrabold tracking-widest text-zinc-400/50 dark:text-zinc-600/40 uppercase">
                  {logo}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* 4. WORKFLOW BUILDER DEMO SHOWCASE */}
      <section className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-20 z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight">
            Design flows in real-time
          </h2>
          <p className="mt-3 text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
            Drag logic cards, configure webhooks parameters, and watch nodes execute queries instantly using our high-performance simulation engine.
          </p>
        </div>

        <div className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-2xl p-4 md:p-6 shadow-premium-hover">
          <WorkflowBuilder readOnly={true} />
        </div>
      </section>

      {/* 5. DYNAMIC FEATURES SECTION */}
      <section className="w-full bg-zinc-950 border-t border-zinc-900 py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
              Powerful under the hood
            </h2>
            <p className="mt-3 text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
              Everything you need to orchestrate complex logic, secure developer routing, and store database logs.
            </p>
          </div>

          <div className="features-grid-gsap grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div 
                  key={i}
                  className="feature-card-gsap tilt-card-gsap glass-panel border border-zinc-800/40 rounded-2xl p-6 hover:border-violet-500/20 transition-all select-none"
                >
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-md font-bold text-white mb-2">{feat.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-light">{feat.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-7xl">
          
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="mt-3 text-sm text-zinc-500 max-w-xl mx-auto leading-relaxed">
              No hidden contracts. Access premium developer consoles and automated nodes instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingTiers.map((tier, i) => (
              <div 
                key={i}
                className={`glass-panel border rounded-3xl p-8 flex flex-col relative transition-all ${
                  tier.isPopular 
                    ? 'border-violet-500 dark:border-violet-500/50 shadow-glow-strong bg-zinc-950/40' 
                    : 'border-zinc-200/10 dark:border-zinc-800/40 bg-zinc-950/10'
                }`}
              >
                {tier.isPopular && (
                  <span className="absolute top-4 right-4 bg-violet-600 text-white text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                    Most Popular
                  </span>
                )}
                
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{tier.name}</h3>
                
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display font-black text-4xl text-zinc-900 dark:text-white">{tier.price}</span>
                  <span className="text-xs text-zinc-500">/ {tier.period}</span>
                </div>

                <p className="mt-2 text-xs text-zinc-500 leading-normal">{tier.desc}</p>
                
                <ul className="mt-8 space-y-3.5 flex-1 mb-8">
                  {tier.features.map((feat, index) => (
                    <li key={index} className="flex items-center gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full py-3 text-center text-xs font-bold rounded-xl transition-all ${
                    tier.isPopular
                      ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-glow'
                      : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="w-full bg-zinc-950 border-t border-zinc-900 py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-16">
            Trusted by modern developers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {[
              {
                text: "Nexus AI allowed us to migrate over 30 custom microservices into a single visual node dashboard. Reduced our infrastructure latency by 45%.",
                user: "Sarah Connor",
                role: "VP of Engineering at Skynet"
              },
              {
                text: "The UI/UX is outstanding. It feels like linear, Stripe, and Apple had a child. The animations are fluid, and visual webhook logic is bulletproof.",
                user: "Lucas Miller",
                role: "Senior Full Stack Dev at Stripe"
              },
              {
                text: "Implementing API Key authentication with SHA-256 fallback was a 5-minute task on Nexus. This platform is production-ready.",
                user: "Elena Rostova",
                role: "Product Designer at Vercel"
              }
            ].map((test, idx) => (
              <div key={idx} className="glass-panel border border-zinc-800/40 rounded-2xl p-6 relative">
                <div className="flex gap-1 mb-4">
                  {Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 fill-violet-500 text-violet-500" />)}
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light mb-6">"{test.text}"</p>
                <div>
                  <h4 className="text-xs font-bold text-white">{test.user}</h4>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{test.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="w-full py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="mx-auto max-w-3xl">
          
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-zinc-900 dark:text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {FAQs.map((faq, i) => (
              <div 
                key={i}
                className="glass-panel border border-zinc-200/10 dark:border-zinc-800/40 rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-violet-500" />
                    {faq.q}
                  </span>
                  <ArrowRight className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${activeFaq === i ? 'rotate-90 text-violet-500' : ''}`} />
                </button>
                
                {activeFaq === i && (
                  <div className="p-5 border-t border-zinc-200/10 dark:border-zinc-800/40 bg-zinc-950/20 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};
