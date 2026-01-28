'use client';

import { Github, Linkedin, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { useState } from 'react';

// --- Interfaces & Data ---
interface Social {
  icon: React.ElementType;
  href: string;
  label: string;
}

interface Member {
  name: string;
  title: string;
  description: string;
  image: string;
  socials: Social[];
}

const members: Member[] = [
  {
    name: 'Tirta Fajar',
    title: 'Project Manager',
    description:
      'Mengoordinasikan visi dan memastikan pengiriman tepat waktu dengan presisi.',
    image: '/team/tirta2.jpeg',
    socials: [
      { icon: Linkedin, href: '#', label: 'LinkedIn' },
      { icon: Github, href: '#', label: 'GitHub' },
    ],
  },
  {
    name: 'Fahru Rahman',
    title: 'Software Designer',
    description: 'Merancang pengalaman pengguna yang intuitif dan estetis.',
    image: '/team/fahru2.jpeg',
    socials: [
      { icon: Linkedin, href: '#', label: 'LinkedIn' },
      { icon: Github, href: '#', label: 'GitHub' },
    ],
  },
  {
    name: 'M. Faris Rasyid',
    title: 'Software Analyst',
    description: 'Menghubungkan kebutuhan bisnis dengan implementasi teknis.',
    image: '/team/faris2.jpeg',
    socials: [
      { icon: Linkedin, href: '#', label: 'LinkedIn' },
      { icon: Github, href: '#', label: 'GitHub' },
    ],
  },
  {
    name: 'Linggar Riza',
    title: 'Programmer',
    description: 'Membangun solusi yang kokoh dan skalabel dengan kode bersih.',
    image: '/team/linggar2.jpeg',
    socials: [
      { icon: Linkedin, href: '#', label: 'LinkedIn' },
      { icon: Github, href: '#', label: 'GitHub' },
    ],
  },
  {
    name: 'Stefano Reza',
    title: 'Technical Writer',
    description: 'Menyusun dokumentasi teknis yang komprehensif.',
    image: '/team/stefano2.jpeg',
    socials: [
      { icon: Linkedin, href: '#', label: 'LinkedIn' },
      { icon: Github, href: '#', label: 'GitHub' },
    ],
  },
  {
    name: 'Steven Winer',
    title: 'QA Tester',
    description: 'Memastikan kualitas melalui strategi pengujian ketat.',
    image: '/team/steven2.jpeg',
    socials: [
      { icon: Linkedin, href: '#', label: 'LinkedIn' },
      { icon: Github, href: '#', label: 'GitHub' },
    ],
  },
];

// --- Component ---
export default function TeamAccordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  return (
    <section className="py-20 text-foreground min-h-screen flex flex-col justify-center relative">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <div className="absolute left-6 top-8 md:left-10 md:top-12">
          <Link href="/">
            <Button
              variant="ghost"
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={20} />
              <span>Kembali</span>
            </Button>
          </Link>
        </div>

        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold md:text-5xl text-foreground">
            Tim Kami
          </h2>
          <p className="mt-4 text-muted-foreground">
            Pilih anggota tim untuk melihat detail
          </p>
        </div>

        {/* Accordion Container */}
        <div className="flex flex-col gap-3 md:h-[400px] md:flex-row lg:h-[500px]">
          {members.map((member, index) => {
            const isActive = activeIndex === index;
            return (
              <div
                key={member.name}
                onClick={() => setActiveIndex(isActive ? null : index)}
                className={cn(
                  'group relative flex cursor-pointer overflow-hidden rounded-2xl bg-muted transition-all duration-700 ease-in-out',
                  isActive
                    ? 'h-[350px] md:h-full md:grow-3'
                    : 'h-[100px] md:h-full md:flex-1'
                )}
              >
                {/* Image Background */}
                <div className="absolute inset-0 h-full w-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className={cn(
                      'h-full w-full object-cover transition-all duration-700 md:group-hover:scale-110',
                      isActive ? 'grayscale-0 scale-105' : 'grayscale'
                    )}
                    priority
                  />
                  <div
                    className={cn(
                      'absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300',
                      isActive ? 'opacity-60' : 'opacity-80'
                    )}
                  />
                </div>

                {/* Vertical Text (Desktop Idle State) / Label (Mobile Idle) */}
                <div
                  className={cn(
                    'absolute bottom-6 left-6 md:bottom-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:-rotate-90 transition-all duration-500',
                    isActive
                      ? 'opacity-0 scale-95 translate-y-4'
                      : 'opacity-100'
                  )}
                >
                  <h3 className="text-xl font-bold tracking-wider text-white/70 whitespace-nowrap uppercase">
                    {member.name}
                  </h3>
                </div>

                {/* Expanded Content */}
                <div
                  className={cn(
                    'absolute inset-0 flex flex-col justify-end p-6 transition-all duration-700',
                    isActive
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8 pointer-events-none'
                  )}
                >
                  <div className="relative z-10">
                    <span className="mb-2 inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary backdrop-blur-sm">
                      {member.title}
                    </span>
                    <h3 className="mb-1 text-2xl font-bold md:text-3xl text-white">
                      {member.name}
                    </h3>
                    <p className="mb-4 text-sm text-white/80 line-clamp-2 md:line-clamp-3 md:w-3/4">
                      {member.description}
                    </p>
                    <div className="flex gap-3">
                      {member.socials.map((social, idx) => (
                        <Link
                          key={idx}
                          href={social.href}
                          className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white hover:text-black text-white"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <social.icon size={18} />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
