export type FeaturedLook = {
  id: string;
  title: string;
  subtitle: string;
  accent: "blush" | "peach" | "lilac" | "mint";
  image: string;
  href: string;
  tag: string;
};

export const featuredLooks: FeaturedLook[] = [
  {
    id: "1",
    title: "Váy nắng sớm",
    subtitle: "Váy xòe pastel, nơ nhỏ — đi chơi cuối tuần cùng mẹ.",
    accent: "blush",
    image:
      "https://images.unsplash.com/photo-1471286174890-9c00182169d7?w=1400&q=80",
    href: "/san-pham?danh-muc=vay",
    tag: "Váy đầm",
  },
  {
    id: "2",
    title: "Set dễ vận động",
    subtitle: "Áo + quần đồng bộ, co giãn nhẹ — bé chạy nhảy cả ngày.",
    accent: "peach",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1400&q=80",
    href: "/san-pham?danh-muc=set",
    tag: "Set bộ",
  },
  {
    id: "3",
    title: "Tiệc nhỏ nhà mình",
    subtitle: "Đầm công chúa voan mềm, không ngứa — chụp hình siêu xinh.",
    accent: "lilac",
    image:
      "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=1400&q=80",
    href: "/san-pham?danh-muc=vay",
    tag: "Đầm tiệc",
  },
  {
    id: "4",
    title: "Nơ & kẹp tóc",
    subtitle: "Phụ kiện hoàn thiện outfit — kẹp nơ, tất, túi mini.",
    accent: "mint",
    image:
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=1400&q=80",
    href: "/san-pham?danh-muc=phu-kien",
    tag: "Phụ kiện",
  },
  {
    id: "5",
    title: "Áo mỏng mùa hè",
    subtitle: "Cotton thoáng, in họa tiết dễ thương — layer với váy hoặc quần.",
    accent: "blush",
    image:
      "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=1400&q=80",
    href: "/san-pham?danh-muc=ao",
    tag: "Áo",
  },
];
