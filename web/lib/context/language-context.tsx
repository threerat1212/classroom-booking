'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'th' | 'en'

const translations = {
  th: {
    home: 'หน้าหลัก',
    login: 'เข้าสู่ระบบ',
    register: 'ลงทะเบียน',
    logout: 'ออกจากระบบ',
    language: 'ภาษา / Language',
    guest: 'ผู้ใช้ทั่วไป',
    admin: 'ผู้ดูแลระบบ',
    teacher: 'อาจารย์',
    student: 'นักศึกษา',
    landing_title: 'ระบบจองห้องประชุมและห้องเรียน',
    landing_subtitle: 'เลือกประเภทห้องที่ต้องการจอง ห้องประชุมจองได้ทันทีโดยไม่ต้องเข้าสู่ระบบ ห้องเรียนต้องเข้าสู่ระบบก่อน',
    meeting_rooms: 'ห้องประชุม',
    meeting_rooms_desc: 'จองห้องประชุมได้ทันทีโดยไม่ต้องเข้าสู่ระบบ',
    classrooms: 'ห้องเรียน',
    classrooms_desc: 'ต้องเข้าสู่ระบบก่อนจึงจะสามารถเข้าใช้งานและจองห้องเรียนได้',
    book_now: 'จองเลย',
    sign_in_now: 'เข้าสู่ระบบ',
    footer_text: 'ระบบจองห้องประชุมและห้องเรียน · สำหรับบุคลากรและนักศึกษา',
    login_title: 'Classroom & Meeting Room',
    login_subtitle: 'ลงชื่อเข้าใช้เพื่อจัดการห้อง การจอง และงานที่ได้รับมอบหมาย',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    or: 'หรือ',
    signin_loading: 'กำลังเข้าสู่ระบบ...',
    secure_login: 'เข้าสู่ระบบอย่างปลอดภัยผ่าน JWT Authentication',
    public_booking_title: 'จองห้องประชุม',
    public_booking_subtitle: 'เลือกห้องประชุมและกรอกข้อมูลเพื่อจองได้ทันที',
    select_meeting_room: 'เลือกห้องประชุม',
    booking_info: 'ข้อมูลการจอง',
    booking_title_label: 'หัวข้อการจอง',
    booking_title_placeholder: 'เช่น ประชุมทีมรายสัปดาห์',
    purpose_label: 'วัตถุประสงค์',
    purpose_placeholder: 'เลือกวัตถุประสงค์',
    purpose_meeting: 'ประชุม',
    purpose_event: 'จัดกิจกรรม',
    purpose_other: 'อื่นๆ',
    start_time: 'วัน-เวลาเริ่มต้น',
    end_time: 'วัน-เวลาสิ้นสุด',
    description_label: 'รายละเอียดเพิ่มเติม (ถ้ามี)',
    description_placeholder: 'เช่น อุปกรณ์ที่ต้องการ, จำนวนผู้เข้าร่วม, ฯลฯ',
    requester_section: 'ข้อมูลผู้จอง',
    requester_name: 'ชื่อ-นามสกุล',
    requester_email: 'อีเมล',
    requester_phone: 'เบอร์โทรศัพท์',
    submit_booking: 'ยืนยันการจอง',
    submitting_booking: 'กำลังส่ง...',
    booking_success_title: 'จองสำเร็จ!',
    booking_success_desc: 'คำขอจองของคุณถูกส่งแล้ว เจ้าหน้าที่จะตรวจสอบและแจ้งผลทางอีเมล',
    book_more: 'จองเพิ่ม',
    capacity_people: 'คน',
    floor_label: 'ชั้น',
    nav_overview: 'ภาพรวม',
    nav_management: 'การจัดการ',
    nav_academic: 'การเรียนการสอน',
    nav_student: 'ข้อมูลนักศึกษา',
    nav_account: 'บัญชีผู้ใช้',
    nav_dashboard: 'Dashboard',
    nav_community: 'ชุมชนการเรียนรู้',
    nav_calendar: 'ปฏิทิน',
    nav_rooms: 'ห้องเรียน/ห้องประชุม',
    nav_bookings: 'การจองห้อง',
    nav_users: 'ผู้ใช้งาน',
    nav_classrooms: 'ห้องเรียนวิชา',
    nav_assignments: 'งานที่มอบหมาย',
    nav_quests: 'เควสการเรียนรู้',
    nav_reward_requests: 'คำขอรางวัล',
    nav_attendance: 'การเข้าเรียน',
    nav_grades: 'คะแนนและเกรด',
    nav_my_dashboard: 'แดชบอร์ดของฉัน',
    nav_my_classrooms: 'ห้องเรียนของฉัน',
    nav_my_assignments: 'งานของฉัน',
    nav_leaderboard: 'ตารางคะแนน',
    nav_rewards: 'ร้านรางวัล',
    nav_notifications: 'การแจ้งเตือน',
    nav_badges: 'ตราเกียรติยศ',
    nav_profile: 'ข้อมูลส่วนตัว',
    nav_settings: 'ตั้งค่าระบบ',
    dashboard_title: 'Dashboard',
    dashboard_subtitle: 'ภาพรวมของระบบจองห้องและระบบการเรียนรู้',
    total_rooms: 'ห้องทั้งหมด',
    active_bookings: 'การจองห้อง',
    assignments: 'จำนวนงาน',
    students: 'นักศึกษา',
    quick_actions: 'เมนูลัด',
    new_booking: 'จองห้องใหม่',
    new_booking_desc: 'จองห้องเรียนหรือห้องประชุม',
    new_assignment: 'มอบหมายงานใหม่',
    new_assignment_desc: 'สร้างงานชิ้นใหม่ให้นักศึกษา',
    view_calendar: 'ปฏิทินการจอง',
    view_calendar_desc: 'ดูตารางเวลาการใช้ห้อง',
  },
  en: {
    home: 'Home',
    login: 'Sign In',
    register: 'Sign Up',
    logout: 'Sign Out',
    language: 'Language / ภาษา',
    guest: 'Guest',
    admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    landing_title: 'Room Booking System',
    landing_subtitle: 'Choose a room to book. Meeting rooms can be booked instantly without logging in. Classrooms require signing in first.',
    meeting_rooms: 'Meeting Rooms',
    meeting_rooms_desc: 'Reserve meeting rooms instantly without logging in.',
    classrooms: 'Classrooms',
    classrooms_desc: 'Sign in first to access classrooms and view courses.',
    book_now: 'Book Now',
    sign_in_now: 'Sign In',
    footer_text: 'Room Booking & Classroom Management System · For staff and students',
    login_title: 'Classroom & Meeting Room',
    login_subtitle: 'Sign in to manage rooms, bookings, and assignments',
    email: 'Email',
    password: 'Password',
    or: 'or',
    signin_loading: 'Signing in...',
    secure_login: 'Secure login powered by JWT authentication',
    public_booking_title: 'Book a Meeting Room',
    public_booking_subtitle: 'Choose a meeting room and fill in details to book instantly',
    select_meeting_room: 'Select a Meeting Room',
    booking_info: 'Booking Details',
    booking_title_label: 'Booking Title',
    booking_title_placeholder: 'e.g. Weekly team meeting',
    purpose_label: 'Purpose',
    purpose_placeholder: 'Select a purpose',
    purpose_meeting: 'Meeting',
    purpose_event: 'Event',
    purpose_other: 'Other',
    start_time: 'Start Time',
    end_time: 'End Time',
    description_label: 'Additional details (optional)',
    description_placeholder: 'e.g. required equipments, number of attendees, etc.',
    requester_section: 'Requester Details',
    requester_name: 'Full Name',
    requester_email: 'Email Address',
    requester_phone: 'Phone Number',
    submit_booking: 'Confirm Booking',
    submitting_booking: 'Submitting...',
    booking_success_title: 'Booking Confirmed!',
    booking_success_desc: 'Your booking request has been submitted. Officers will review and notify you via email.',
    book_more: 'Book More',
    capacity_people: 'people',
    floor_label: 'Floor',
    nav_overview: 'Overview',
    nav_management: 'Management',
    nav_academic: 'Academic',
    nav_student: 'Student Portal',
    nav_account: 'Account',
    nav_dashboard: 'Dashboard',
    nav_community: 'Community',
    nav_calendar: 'Calendar',
    nav_rooms: 'Rooms',
    nav_bookings: 'Bookings',
    nav_users: 'Users',
    nav_classrooms: 'Classrooms',
    nav_assignments: 'Assignments',
    nav_quests: 'Learning Quests',
    nav_reward_requests: 'Reward Requests',
    nav_attendance: 'Attendance',
    nav_grades: 'Grades',
    nav_my_dashboard: 'My Dashboard',
    nav_my_classrooms: 'My Classrooms',
    nav_my_assignments: 'My Assignments',
    nav_leaderboard: 'Leaderboard',
    nav_rewards: 'Reward Shop',
    nav_notifications: 'Notifications',
    nav_badges: 'Badges',
    nav_profile: 'Profile',
    nav_settings: 'Settings',
    dashboard_title: 'Dashboard',
    dashboard_subtitle: 'Overview of classroom and room management',
    total_rooms: 'Total Rooms',
    active_bookings: 'Active Bookings',
    assignments: 'Assignments',
    students: 'Students',
    quick_actions: 'Quick Actions',
    new_booking: 'New Booking',
    new_booking_desc: 'Book a room',
    new_assignment: 'New Assignment',
    new_assignment_desc: 'Create task',
    view_calendar: 'View Calendar',
    view_calendar_desc: 'See schedule',
  },
}

interface LanguageContextProps {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: keyof typeof translations['th']) => string
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('th')

  useEffect(() => {
    const saved = localStorage.getItem('app-lang') as Language
    if (saved === 'th' || saved === 'en') {
      setLangState(saved)
    }
  }, [])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('app-lang', newLang)
  }

  const t = (key: keyof typeof translations['th']) => {
    return translations[lang][key] || translations['th'][key] || String(key)
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
