import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, useInView, useSpring, AnimatePresence } from "framer-motion";
import { Instagram, Linkedin, Dribbble as Behance } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSubmitContact } from "@workspace/api-client-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const projects = [
  { id: 1, title: "Vaarint", tag: "SEO Strategy", img: "/images/work-vaarint.png" },
  { id: 2, title: "Caasto", tag: "Organic Growth", img: "/images/work-caasto.png" },
  { id: 3, title: "Creator Campaign System", tag: "Campaigns", img: "/images/work-creator.png" },
  { id: 4, title: "Brand Visibility Audit", tag: "Audit", img: "/images/work-audit.png" },
  { id: 5, title: "Local SEO Optimization", tag: "Local SEO", img: "/images/work-localseo.png" },
  { id: 6, title: "Social Media Branding", tag: "Branding", img: "/images/work-socialbranding.png" },
  { id: 7, title: "Search Ranking Campaign", tag: "Performance", img: "/images/work-ranking.png" },
  { id: 8, title: "Content Marketing Strategy", tag: "Content", img: "/images/work-content.png" },
  { id: 9, title: "Performance SEO Framework", tag: "Framework", img: "/images/work-performance.png" },
];

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  service: z.enum([
    "SEO",
    "Social Media Marketing",
    "Branding",
    "Website Marketing",
    "Consultation",
  ]),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

function CountUp({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  useEffect(() => {
    if (!inView) return;
    let current = 0;
    const duration = 1400;
    const steps = 60;
    const increment = target / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [inView, target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const marqueeItems = [
  "SEO Strategy", "Brand Growth", "Content Marketing", "Social Media",
  "Performance SEO", "Organic Traffic", "Digital Presence", "Search Rankings",
  "Creative Systems", "Brand Visibility",
];

function MarqueeStrip() {
  return (
    <div className="overflow-hidden border-y border-border py-5 bg-background select-none">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap will-change-transform"
      >
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-6">
            <span className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">{item}</span>
            <span className="w-1 h-1 rounded-full bg-accent shrink-0" />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  const { scrollY, scrollYProgress } = useScroll();
  const scrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  const [scrolled, setScrolled] = useState(false);
  const [showFloat, setShowFloat] = useState(false);

  const heroCircleY = useTransform(scrollY, [0, 700], [0, -160]);
  const heroContentOpacity = useTransform(scrollY, [0, 380], [1, 0]);
  const heroContentY = useTransform(scrollY, [0, 380], [0, -40]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowFloat(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase() === "A" ||
        target.tagName.toLowerCase() === "BUTTON" ||
        target.closest("a") ||
        target.closest("button")
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      service: "Consultation",
      message: "",
    },
  });

  const submitContact = useSubmitContact();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const onSubmit = (data: ContactFormValues) => {
    setSubmitSuccess(false);
    setSubmitError(false);
    submitContact.mutate(
      { data: { ...data, service: data.service as any } },
      {
        onSuccess: () => {
          setSubmitSuccess(true);
          form.reset();
        },
        onError: () => {
          setSubmitError(true);
        },
      }
    );
  };

  const navLinks = [
    { name: "Work", href: "#work" },
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background"
          >
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="font-serif italic text-4xl md:text-5xl text-foreground mb-4"
            >
              Anuj Tripathi
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="font-sans text-xs uppercase tracking-[0.2em] text-foreground"
            >
              Quiet strategies. Loud growth.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        ref={cursorRef}
        animate={{
          x: cursorPos.x - 11,
          y: cursorPos.y - 11,
          scale: isHovering ? 1.5 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 28, mass: 2 }}
        className="pointer-events-none fixed top-0 left-0 z-50 w-[22px] h-[22px] rounded-full border border-accent hidden md:block"
      />

      <motion.div
        style={{ scaleX: scrollProgress, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 h-[2px] bg-accent z-50 pointer-events-none"
      />

      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ease-in-out ${
          scrolled ? "bg-background/80 backdrop-blur-md border-b border-border" : "bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 md:py-6 flex items-center justify-between">
          <a href="#" className="font-serif italic text-xl text-foreground">
            AT
          </a>
          <div className="flex items-center gap-6 md:gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-sans uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors duration-400"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      <main className="w-full min-h-screen">
        <section className="relative w-full min-h-[100dvh] flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.8 }}
            style={{ y: heroCircleY }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-[40vw] h-[80vh] rounded-l-full border border-accent/20 hidden md:block pointer-events-none"
          />

          <motion.div style={{ opacity: heroContentOpacity, y: heroContentY }} className="w-full max-w-4xl z-10">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.5, ease: "easeOut" }}
              className="text-[10px] md:text-xs font-sans uppercase tracking-[0.3em] text-muted-foreground mb-8"
            >
              PORTFOLIO · 2026
            </motion.p>

            <h1 className="font-serif text-[12vw] md:text-[8rem] leading-[0.9] text-foreground flex flex-col">
              <span className="overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 1.7, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  Quietly
                </motion.span>
              </span>
              <span className="overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 1.9, ease: [0.33, 1, 0.68, 1] }}
                  className="block text-accent italic pr-4"
                >
                  loud
                </motion.span>
              </span>
              <span className="overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 2.1, ease: [0.33, 1, 0.68, 1] }}
                  className="block"
                >
                  marketing.
                </motion.span>
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 2.4, ease: "easeOut" }}
              className="mt-12 text-sm md:text-base font-sans text-muted-foreground max-w-lg leading-relaxed"
            >
              Anuj Tripathi — Independent digital marketer specializing in SEO, branding, and growth systems for modern creators and businesses.
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2.8 }}
            className="absolute bottom-10 left-6 md:left-12 flex flex-col items-center gap-2"
          >
            <div className="w-[1px] h-12 bg-border relative overflow-hidden">
              <motion.div
                animate={{ y: [0, 48] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-1/2 bg-foreground"
              />
            </div>
            <div className="w-1 h-1 rounded-full border border-foreground" />
          </motion.div>
        </section>

        <MarqueeStrip />

        <section id="work" className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="font-serif italic text-4xl md:text-5xl text-foreground mb-16">
              Selected Work
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: "easeOut" }}
                className="group relative cursor-pointer block"
              >
                <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-6">
                  <motion.img
                    src={project.img}
                    alt={project.title}
                    className="w-full h-full object-cover saturate-[0.85] brightness-[0.97]"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/25 transition-colors duration-500 z-10" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-[#F2EBDD]/80">
                      View Project
                    </span>
                  </div>
                </div>
                <div className="relative z-20 transition-transform duration-500 group-hover:-translate-y-2">
                  <h3 className="font-serif italic text-xl md:text-2xl text-foreground mb-2">
                    {project.title}
                  </h3>
                  <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground">
                    {project.tag}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 md:py-32 px-6 md:px-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-16"
            >
              <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-4">What clients say</p>
              <h2 className="font-serif italic text-4xl md:text-5xl text-foreground">Kind words.</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: "Anuj completely transformed our search visibility. Within three months our organic traffic doubled and the quality of leads improved significantly. His approach is methodical, calm, and deeply effective.",
                  name: "Rohan Mehta",
                  role: "Founder, Vaarint",
                  index: 0,
                },
                {
                  quote: "Working with Anuj felt like having a senior strategist on the team. He understood our brand voice immediately and built a content framework that we still use today. Genuinely refined work.",
                  name: "Priya Nair",
                  role: "Marketing Head, Caasto",
                  index: 1,
                },
                {
                  quote: "He doesn't just deliver reports — he delivers clarity. The brand audit he did for us exposed gaps we had no idea existed. Our Instagram engagement has grown 3x since we applied his recommendations.",
                  name: "Arjun Sharma",
                  role: "Creative Director, Studio Ink",
                  index: 2,
                },
                {
                  quote: "Anuj's SEO strategy is unlike anything we had tried before. Very measured, very intentional. Our local search rankings moved from page 4 to position 2 in under six weeks.",
                  name: "Kavya Iyer",
                  role: "Owner, The Local Shelf",
                  index: 3,
                },
                {
                  quote: "The performance framework he built became the backbone of our digital presence. Clean thinking, no fluff — exactly what a growing brand needs. I would recommend him without hesitation.",
                  name: "Vikram Bose",
                  role: "Co-Founder, Growfield",
                  index: 4,
                },
                {
                  quote: "From our very first call, Anuj brought a level of strategic depth that surprised us. He asked the right questions and delivered a social media branding system that actually holds together visually and strategically.",
                  name: "Sneha Kulkarni",
                  role: "Brand Manager, Orion Collective",
                  index: 5,
                },
              ].map((t) => (
                <motion.div
                  key={t.index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.7, delay: (t.index % 3) * 0.12, ease: "easeOut" }}
                  className="bg-background border border-border rounded-xl p-8 md:p-10 flex flex-col justify-between group hover:border-accent/30 transition-colors duration-500"
                >
                  <div>
                    <span className="font-serif italic text-4xl text-accent/40 leading-none select-none">"</span>
                    <p className="font-sans text-sm text-foreground/80 leading-relaxed mt-2 mb-8">
                      {t.quote}
                    </p>
                  </div>
                  <div className="pt-6 border-t border-border">
                    <p className="font-serif italic text-base text-foreground">{t.name}</p>
                    <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{t.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-24 md:py-32 px-6 md:px-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <h2 className="font-serif italic text-4xl md:text-6xl text-foreground">
                Strategy with intention.
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="flex flex-col justify-center"
            >
              <p className="font-sans text-base md:text-lg text-foreground/80 leading-relaxed mb-12">
                Anuj Tripathi is an independent digital marketer based in India, helping brands and creators grow through strategic SEO, performance marketing, and visually intentional digital systems. From search visibility to social presence, he builds marketing experiences that feel refined, modern, and effective.
              </p>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <div className="flex items-center gap-6">
                  <span className="font-serif italic text-sm md:text-base text-foreground">
                    <CountUp target={1} suffix="+" /> Year Experience
                  </span>
                  <span className="w-1 h-1 rounded-full bg-accent" />
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-serif italic text-sm md:text-base text-foreground">
                    <CountUp target={50} suffix="+" /> Projects Delivered
                  </span>
                  <span className="w-1 h-1 rounded-full bg-accent" />
                </div>
                <div className="flex items-center gap-6">
                  <span className="font-serif italic text-sm md:text-base text-foreground">
                    SEO & Digital Growth Specialist
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="services" className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: "01", title: "SEO Strategy", desc: "Architecting search presence that compounds. Technical audits, keyword strategy, and content frameworks built for long-term visibility.", img: "/images/service-seo.png" },
              { num: "02", title: "Social Media Marketing", desc: "Building narrative-driven presence across platforms. Strategic content, community, and campaigns that resonate.", img: "/images/service-social.png" },
              { num: "03", title: "Brand Growth Systems", desc: "Holistic digital ecosystems that align your brand's voice, visual identity, and marketing systems for sustained growth.", img: "/images/service-brand.png" }
            ].map((service, index) => (
              <motion.div
                key={service.num}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
                className="group rounded-xl border border-border bg-transparent hover:bg-secondary transition-colors duration-500 relative overflow-hidden flex flex-col"
              >
                <div className="relative overflow-hidden aspect-[4/3] w-full rounded-t-xl">
                  <img
                    src={service.img}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 saturate-[0.88] brightness-[0.97]"
                  />
                  <div className="absolute inset-0 bg-[#1A1815]/0 group-hover:bg-[#1A1815]/10 transition-colors duration-500" />
                </div>
                <div className="p-8 md:p-10 flex flex-col flex-1">
                  <div className="font-serif italic text-3xl text-accent mb-6">
                    {service.num}
                  </div>
                  <h3 className="font-sans font-medium text-lg text-foreground mb-4">
                    {service.title}
                  </h3>
                  <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                    {service.desc}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Process */}
        <section className="py-24 md:py-32 px-6 md:px-12 bg-secondary/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-20"
            >
              <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-4">How I work</p>
              <h2 className="font-serif italic text-4xl md:text-5xl text-foreground">The process.</h2>
            </motion.div>

            <div className="relative">
              <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-border" />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
                {[
                  {
                    step: "01",
                    title: "Discover",
                    desc: "A deep dive into your brand, audience, and competitive landscape. Understanding the full picture before touching a single tactic.",
                  },
                  {
                    step: "02",
                    title: "Strategize",
                    desc: "Building a clear, prioritized roadmap. Every recommendation is intentional — no filler, no noise, only what moves the needle.",
                  },
                  {
                    step: "03",
                    title: "Execute",
                    desc: "Precise, measured implementation. Each action is tracked and refined in real time so momentum compounds from day one.",
                  },
                  {
                    step: "04",
                    title: "Grow",
                    desc: "Sustainable, compounding results. Not a spike — a system. Brands leave with infrastructure that keeps growing long after we're done.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, delay: index * 0.13, ease: "easeOut" }}
                    className="relative pt-0 md:pt-16 group"
                  >
                    <div className="hidden md:block absolute top-0 left-0 w-3 h-3 rounded-full border-2 border-accent -translate-y-[5px] bg-background group-hover:bg-accent transition-colors duration-500" />
                    <p className="font-serif italic text-5xl md:text-6xl text-accent/20 mb-6 leading-none select-none">
                      {item.step}
                    </p>
                    <h3 className="font-serif italic text-2xl md:text-3xl text-foreground mb-4">
                      {item.title}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tools & Platforms */}
        <section className="py-24 md:py-32 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <p className="font-sans text-[10px] uppercase tracking-widest text-muted-foreground mb-4">Tools & Platforms</p>
              <h2 className="font-serif italic text-4xl md:text-5xl text-foreground">The craft behind<br />the strategy.</h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="font-sans text-sm text-muted-foreground max-w-xs leading-relaxed md:text-right"
            >
              A curated stack of tools used to research, build, measure, and refine every campaign.
            </motion.p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {[
              { category: "Analytics", name: "Google Analytics", use: "Traffic & behaviour tracking" },
              { category: "SEO", name: "Google Search Console", use: "Search visibility monitoring" },
              { category: "Keyword Research", name: "Ahrefs", use: "Backlinks & keyword data" },
              { category: "Competitive Intel", name: "SEMrush", use: "Market & competitor analysis" },
              { category: "Paid Social", name: "Meta Ads Manager", use: "Facebook & Instagram campaigns" },
              { category: "Visual Content", name: "Canva", use: "Branded creative assets" },
              { category: "Performance", name: "Google Ads", use: "Search & display advertising" },
              { category: "Email Marketing", name: "Mailchimp", use: "Campaigns & automation" },
              { category: "Technical SEO", name: "Screaming Frog", use: "Site audits & crawl analysis" },
              { category: "Social Scheduling", name: "Buffer", use: "Content calendar & publishing" },
              { category: "CRM", name: "HubSpot", use: "Lead tracking & nurture flows" },
              { category: "Design Systems", name: "Figma", use: "Layout & brand prototyping" },
            ].map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
                className="group relative bg-background px-6 py-8 flex flex-col justify-between hover:bg-secondary transition-colors duration-500 overflow-hidden cursor-default"
              >
                <p className="font-sans text-[9px] uppercase tracking-widest text-accent mb-4">{tool.category}</p>
                <div>
                  <h3 className="font-serif italic text-lg md:text-xl text-foreground mb-2 leading-tight">{tool.name}</h3>
                  <p className="font-sans text-[11px] text-muted-foreground leading-relaxed">{tool.use}</p>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-accent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
              </motion.div>
            ))}
          </div>
        </section>

        <section id="contact" className="py-24 md:py-32 px-6 md:px-12 bg-secondary/20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="mb-16"
            >
              <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6">
                Let's build something <span className="italic text-accent">quietly powerful.</span>
              </h2>
              <p className="font-sans text-muted-foreground">
                Open to strategic collaborations, consulting, and creative partnerships.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            >
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Name</FormLabel>
                          <FormControl>
                            <Input className="bg-transparent border-b border-0 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent text-base py-4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Email</FormLabel>
                          <FormControl>
                            <Input className="bg-transparent border-b border-0 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent text-base py-4" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="service"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Service</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-b border-0 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent text-base py-4 shadow-none">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-background border border-border">
                            <SelectItem value="SEO">SEO Strategy</SelectItem>
                            <SelectItem value="Social Media Marketing">Social Media Marketing</SelectItem>
                            <SelectItem value="Branding">Branding</SelectItem>
                            <SelectItem value="Website Marketing">Website Marketing</SelectItem>
                            <SelectItem value="Consultation">Consultation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-sans text-xs uppercase tracking-widest text-muted-foreground">Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            className="bg-transparent border-b border-0 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-accent text-base py-4 min-h-[120px] resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <Button 
                      type="submit" 
                      disabled={submitContact.isPending}
                      className="w-full md:w-auto bg-background text-foreground border border-accent hover:bg-accent hover:text-background rounded-full px-12 py-6 font-sans text-sm tracking-wide transition-all duration-400"
                    >
                      {submitContact.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {submitSuccess && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-foreground italic font-serif"
                      >
                        Message received. I'll be in touch shortly.
                      </motion.p>
                    )}
                    {submitError && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-sm text-destructive"
                      >
                        Something went wrong. Please try again.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </Form>

              <div className="mt-16 flex flex-row items-center gap-8 pt-12 border-t border-border">
                <a href="mailto:anujtripathi2612@gmail.com" className="font-sans text-sm text-muted-foreground hover:text-foreground transition-colors">
                  anujtripathi2612@gmail.com
                </a>
                <div className="flex items-center gap-5">
                  <a href="https://www.instagram.com/tripathi_anuj01" target="_blank" rel="noreferrer" data-testid="link-instagram-contact" className="text-muted-foreground hover:text-accent transition-colors duration-400" aria-label="Instagram">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://www.linkedin.com/in/anuj-tripathi-marketing-specialist" target="_blank" rel="noreferrer" data-testid="link-linkedin-contact" className="text-muted-foreground hover:text-accent transition-colors duration-400" aria-label="LinkedIn">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="font-sans text-xs text-muted-foreground">
            Anuj Tripathi · Digital Marketer · 2026
          </p>
          
          <p className="font-serif italic text-xs text-muted-foreground md:absolute md:left-1/2 md:-translate-x-1/2">
            Made with intention.
          </p>

          <div className="flex items-center gap-6 text-muted-foreground">
            <a href="https://www.instagram.com/tripathi_anuj01" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors" data-testid="link-instagram-footer"><Instagram className="w-4 h-4" /></a>
            <a href="https://www.linkedin.com/in/anuj-tripathi-marketing-specialist" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors" data-testid="link-linkedin-footer"><Linkedin className="w-4 h-4" /></a>
            <a href="https://www.instagram.com/tripathi_anuj01" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors" data-testid="link-behance-footer"><Behance className="w-4 h-4" /></a>
          </div>
        </div>
      </footer>

      {/* Floating Let's Talk button */}
      <AnimatePresence>
        {showFloat && (
          <motion.a
            href="#contact"
            data-testid="button-float-contact"
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-6 py-3 rounded-full border border-accent bg-background text-foreground font-sans text-xs uppercase tracking-widest shadow-sm hover:bg-accent hover:text-background transition-colors duration-500 group"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent group-hover:bg-background transition-colors duration-500" />
            Let's Talk
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}
