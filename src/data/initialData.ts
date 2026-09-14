import { Product, Category, Order } from '@/types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'جميع التشكيلات', slug: 'all', icon: 'auto_awesome' },
  { id: 'cat-men', name: 'عطور رجالية', slug: 'men', icon: 'man' },
  { id: 'cat-women', name: 'عطور نسائية', slug: 'women', icon: 'woman' },
  { id: 'cat-unisex', name: 'للجنسين (Unisex)', slug: 'unisex', icon: 'group' },
  { id: 'cat-exclusive', name: 'إصدارات نادرة وحصرية', slug: 'exclusive', icon: 'diamond' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-creed-aventus',
    name: 'Creed Aventus',
    slug: 'creed-aventus',
    description: 'الأيقونة العالمية وأسطورة دار كريد. عطر يجسد القوة والنجاح والسيادة بتوليفة فاكهية مدخنة لا تُقاوم. يبدأ بانفجار منعش من الأناناس والبرغموت ليتدرج نحو عمق الباتشولي وخشب البتولا الأسطوري.',
    price: 38500,
    discount_price: 32900,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBtcbqpUmYHNXcue2E3Whgd52jOYZUGgnuNDY9q94qzJpWwOKHwQCmbZIYQGKy2KKroPNikPmI0CiF4KdtSyyOtoaE-_yl_p4ceKmrdz2pQf0sIlwrY2KhsSlb84guqoG5wiWU5SPIMRgdHNNw4yjFLdiizPly_SkvzDXsbXfEXNM919x1KjkNCWxeekUcw5DXNPEVOrbhu7fCbd-_8U4nk7jzxEbHCK84ioSWnJr9uGtpIxY_rZv7E'
    ],
    category_id: 'cat-men',
    category_name: 'عطور رجالية',
    brand: 'Creed',
    stock: 18,
    is_featured: true,
    concentration: 'Eau De Parfum',
    size: '100ml',
    rating: 4.9,
    review_count: 342,
    fragrance_notes: {
      top: ['أناناس ملكي', 'برغموت إيطالي', 'تفاح فرنسي', 'كشمش أسود'],
      heart: ['أخشاب البتولا المدخنة', 'باتشولي نقي', 'ياسمين مغربي', 'توت العرعر'],
      base: ['عنبر الحوت الفاخر', 'طحلب السنديان', 'فانيليا بوربون', 'المسك الأبيض']
    },
    created_at: new Date('2025-01-10').toISOString(),
  },
  {
    id: 'prod-silver-mountain-water',
    name: 'Creed Silver Mountain Water',
    slug: 'creed-silver-mountain-water',
    description: 'مستوحى من نقاء وبهاء جبال الألب السويسرية وتدفق المياه العذبة الكريستالية. عطر أوزوني نقي يبعث على الانتعاش الفوري والطاقة المتجددة بنفحات الشاي الأخضر والكشمش الأسود.',
    price: 34000,
    discount_price: 29500,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDSYAKXh0F2qCnzNVpfgUTHDKTcV1dqXfpefwKj_mEGHyoBDjZasPFw7B6yZBBvvbuNskE3ETX8h0l4gu24-PfsaHqq2dAmmBw9xD38uEJPrXvV59TkVxziIXgb_NYHXF6UXbKY2SntLKBbPUH3jn35Etx9_M-vi4rshLlrBiSzm6BiSR62PgdOa_9Gfb13mjbPdllTl6zAW7vNFEVO3mfFbl-ohBvrZwHTkOMxT4onYDorVTzYxVbY',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDadRTqZ1L9s6O4WXkID5Vx34NBp4AIX09GavxGag7n_2SdFEmqCTw4CaKfN9ZzfKz9Ig-cqKawO-YTYb8YAk8_M1wliBOBH4Dif8pILuoiiWvKuitbxtO-uepy4t-zcs3XQwbaQkYyE9RNkZD9x0T5bUr9lK4nL4_1MHjs2xte-K7ahI4csywV3RB6tz83WmmbwsbNeGr7ouU2ex2fK5PehdSbcH5phvXt40VH4I-_iLeVVhzdiLXB'
    ],
    category_id: 'cat-unisex',
    category_name: 'للجنسين (Unisex)',
    brand: 'Creed',
    stock: 12,
    is_featured: true,
    concentration: 'Eau De Parfum',
    size: '100ml',
    rating: 4.8,
    review_count: 215,
    fragrance_notes: {
      top: ['برغموت كالابريا', 'يوسفي منعش', 'نيرولي'],
      heart: ['شاي أخضر نقي', 'كشمش أسود جبلي', 'أوزون متجمد'],
      base: ['مسك ناصع', 'خشب الصندل', 'بيتي غران', 'صمغ راتينجي']
    },
    created_at: new Date('2025-01-15').toISOString(),
  },
  {
    id: 'prod-green-irish-tweed',
    name: 'Creed Green Irish Tweed',
    slug: 'creed-green-irish-tweed',
    description: 'العطر الكلاسيكي النبيل المفضل لدى أرستقراطيي أوروبا ونجوم هوليوود. نزهة صباحية ساحرة في الريف الأيرلندي الندي بين أوراق البنفسج المقطوفة حديثاً ونسيم البحر المنعش.',
    price: 33000,
    discount_price: 28900,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'
    ],
    category_id: 'cat-men',
    category_name: 'عطور رجالية',
    brand: 'Creed',
    stock: 9,
    is_featured: false,
    concentration: 'Eau De Parfum',
    size: '100ml',
    rating: 4.9,
    review_count: 180,
    fragrance_notes: {
      top: ['ليمون صقلي منعش', 'رعي الحمام الليموني', 'نعناع بري'],
      heart: ['أوراق البنفسج الخضراء الندية', 'سوسن نبيل'],
      base: ['عنبر الحوت الرمادي', 'خشب الصندل الميسوري', 'خشب الأرز']
    },
    created_at: new Date('2025-01-20').toISOString(),
  },
  {
    id: 'prod-millesime-imperial',
    name: 'Creed Millésime Impérial',
    slug: 'creed-millesime-imperial',
    description: 'صُنع احتفاءً بالملكية والأناقة المطلقة. زجاجة ذهبية تخفي مزيجاً استثنائياً من الحمضيات الصقلية المشمسة والملح البحري الفاخر لتعكس فخامة القصور المطلة على البحر المتوسط.',
    price: 35000,
    discount_price: 31000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA5r_iHJnOD9Dc-1WtEOU6T3eqDs9_HgH3no--xrmLt1nitxzMjSIleUHevCIPMqAnbAn7oORwH7hmTM-i9YiXA3S9nMD92sqbDophyF5mNprX0t_cQUOBd-em0m04fSw58LXPiF8348XM1S1iA5JQd3ibWdQU-0Pn1DRwyxjo6WFhVwPTQ6d3wUdigYlig4d06Aglz3j_nZ6PzfUIrH19QOJnv7VCHGbKUkZhpJWc3JFV_THu2Brt_'
    ],
    category_id: 'cat-unisex',
    category_name: 'للجنسين (Unisex)',
    brand: 'Creed',
    stock: 14,
    is_featured: true,
    concentration: 'Eau De Parfum',
    size: '100ml',
    rating: 4.7,
    review_count: 164,
    fragrance_notes: {
      top: ['فواكه حمضية مشمسة', 'ملح بحري نقي'],
      heart: ['ليمون صقلي مبهج', 'برغموت', 'سوسن فلورنسي', 'يوسفي'],
      base: ['مسك حسي راقي', 'أخشاب الأرز العطرية', 'نفحات بحرية عميقة']
    },
    created_at: new Date('2025-02-01').toISOString(),
  },
  {
    id: 'prod-wind-flowers',
    name: 'Creed Wind Flowers',
    slug: 'creed-wind-flowers',
    description: 'قصيدة مفعمة بالأنوثة والقوة والرشقة الراقصة. باقة أزهار متفتحة من زهر البرتقال والياسمين تتمايل بخفة على قاعدة دافئة من خشب الصندل والبرالين الشهي.',
    price: 36500,
    discount_price: 31500,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCiV5aod7u2d7tdYUVPGzPkTbLk6K0WQx8eM9t_rYUU7wQ6acLw58STGJ5MLKZ_u9VfM0Tu0QRN24hJxj4cUZqUvggBm5vJ44WYFLr6QpToH6XE_jaIQaGg6gt_vRIn54kqUhAiNHj42g2nH28uPlqLo_HmZTJw-fhzbh3jM0WCH2dc7NSvdxvNHPahFHAGfVyPg0hElo_gLRKWGyOoDbLW-gYcU7ZYp6U2shg_k8APkvxu-qN-orzn',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEcz8b1SegeKPxbmUYFhElgYu3eTVfB9SptfaW86OvOjCEXje1PDwTYwfJINR45v-Ujqn4K7HntsEVDQkUtfzKPZADylLr9bAN-xDJbnFkDs90XMjVdBc5UTm2zaH4N86Rgo68pDxRy0OtfPgB5v8z1IHq8FCi6Y3Qu1gNpAmvnLgAi_wZx9sm3zGNeExIXjMUByWlNvbqWJMDdBDyNRhS4Vv0XOxRfDpV2futpRRLYyT3iGvr-rO0'
    ],
    category_id: 'cat-women',
    category_name: 'عطور نسائية',
    brand: 'Creed',
    stock: 11,
    is_featured: true,
    concentration: 'Eau De Parfum',
    size: '75ml',
    rating: 4.9,
    review_count: 145,
    fragrance_notes: {
      top: ['زهر البرتقال التونسي', 'خوخ مخملي حلو', 'ياسمين هندي نقي'],
      heart: ['ياسمين سامباك', 'ورد سنتيفوليا', 'مسك الروم الأبيض'],
      base: ['برالين كريمي سويسري', 'خشب الصندل الدافئ', 'سوسن مطحون', 'مسك ناعم']
    },
    created_at: new Date('2025-02-05').toISOString(),
  },
  {
    id: 'prod-carmina',
    name: 'Creed Carmina',
    slug: 'creed-carmina',
    description: 'العطر الجريء الآسر بنوتات الكرز الأسود الجذاب والزعفران الحار. عطر مخصص للسيدات الواثقات الراغبات في ترك بصمة عطرية ساحرة تدوم طوال السهرة.',
    price: 37000,
    discount_price: null,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEcz8b1SegeKPxbmUYFhElgYu3eTVfB9SptfaW86OvOjCEXje1PDwTYwfJINR45v-Ujqn4K7HntsEVDQkUtfzKPZADylLr9bAN-xDJbnFkDs90XMjVdBc5UTm2zaH4N86Rgo68pDxRy0OtfPgB5v8z1IHq8FCi6Y3Qu1gNpAmvnLgAi_wZx9sm3zGNeExIXjMUByWlNvbqWJMDdBDyNRhS4Vv0XOxRfDpV2futpRRLYyT3iGvr-rO0'
    ],
    category_id: 'cat-women',
    category_name: 'عطور نسائية',
    brand: 'Creed',
    stock: 7,
    is_featured: false,
    concentration: 'Eau De Parfum',
    size: '75ml',
    rating: 4.9,
    review_count: 98,
    fragrance_notes: {
      top: ['كرز أسود غني', 'زعفران أحمر نادر', 'فلفل وردي مدغشقري'],
      heart: ['ورد دي ماي الفاخر', 'بنفسج بري', 'خشب الكشمير الأنيق'],
      base: ['لبان شرقي مبخر', 'عنبر ذهبي دافئ', 'مر صومالي', 'مسك مخملي']
    },
    created_at: new Date('2025-02-12').toISOString(),
  },
  {
    id: 'prod-royal-oud',
    name: 'Creed Royal Oud',
    slug: 'creed-royal-oud',
    description: 'تفسير أوروبي فاخر لجوهر العود الشرقي. يمزج بين التوابل الناعمة وخشب الأرز اللبناني والعود الهندي بأسلوب ملكي راقٍ يمنح هيبة وفخامة لا مثيل لها.',
    price: 42000,
    discount_price: 36900,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBELzM-IoW4Xjkbx68qEd73dviJQxA2ccZRcWJ3LFpqyvCHQNolRntNE86aHyj_Cu4j2nyzQOliPAeAa0cvkeJymnO8HZs7WphcKGh8nf8xVTxR7NW4DW8nUVYr0LYVazs7D3LQsmoblv-SH9tv07ym3zgYjkMCY7fjNq3_U8DrrOtYdYd9Wql73ain7V93oIF2gfoXLwq1za3p8KRvG_J_7Aj9n3NsexT4JD-4kC9qU2iEUNaS4IHt'
    ],
    category_id: 'cat-exclusive',
    category_name: 'إصدارات نادرة وحصرية',
    brand: 'Creed',
    stock: 5,
    is_featured: true,
    concentration: 'Eau De Parfum',
    size: '100ml',
    rating: 5.0,
    review_count: 112,
    fragrance_notes: {
      top: ['ليمون كالابريا', 'فلفل وردي حار', 'برغموت صقلي'],
      heart: ['خشب الأرز العطري', 'حشيشة الملاك', 'كرفس بري نبيل'],
      base: ['عود هندي أصيل نقي', 'خشب الصندل الميسوري', 'خشب الغاياك الدخاني']
    },
    created_at: new Date('2025-02-18').toISOString(),
  },
  {
    id: 'prod-aventus-for-her',
    name: 'Creed Aventus For Her',
    slug: 'creed-aventus-for-her',
    description: 'النسخة النسائية الملحمية من أسطورة أفينتوس. تحتفي بالمرأة القوية الرائدة بتركيبة تجمع بين التفاح الأخضر المقرمش والورود الدمشقية وخشب الصندل الدافئ.',
    price: 36000,
    discount_price: 30900,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCZkaNZLpbxcT4hmeFuqYIm-XtIHbjpPU1vyjKRVIcK6DJ1h3Hhu9oTZRezefU5NYHdYgdNd_LbBcq_tkQozge3iZJBP6_eBYh41YGCb7TeNAvzqk-IuChOk5XiCHyO_3p4Gsvg48O_9y9BEKVmSBqvbCMi9FkdU4c3o2LjpXRZdWt4veiYB0Cg0A3NFiHpCWEONhB2I3TOVR-bADq3dZUqaS4iSF9tcmsSuleMY3NAO-54y5Z7Fpng'
    ],
    category_id: 'cat-women',
    category_name: 'عطور نسائية',
    brand: 'Creed',
    stock: 8,
    is_featured: false,
    concentration: 'Eau De Parfum',
    size: '75ml',
    rating: 4.8,
    review_count: 129,
    fragrance_notes: {
      top: ['تفاح أخضر مقرمش', 'برغموت منعش', 'أوراق البنفسج', 'فلفل وردي'],
      heart: ['ورد دمشقي ندي', 'خشب الصندل', 'ستيراكس صمغي'],
      base: ['عنبر الحوت', 'يلانغ يلانغ', 'دراق حلو', 'كشمش أسود']
    },
    created_at: new Date('2025-02-22').toISOString(),
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-84921',
    order_number: 'DZ-84921',
    customer_name: 'أمين بلقاسم',
    phone: '0550123456',
    phone_secondary: '0661987654',
    wilaya: '16 - الجزائر العاصمة',
    wilaya_code: '16',
    commune: 'سيدي يحيى، حيدرة',
    address: 'حي 200 مسكن، عمارة ب، شقة 14',
    notes: 'يرجى الاتصال قبل الوصول بنصف ساعة، التسليم بعد الساعة 4 مساءً',
    items: [
      {
        product_id: 'prod-creed-aventus',
        name: 'Creed Aventus (100ml)',
        price: 32900,
        qty: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'
      }
    ],
    total_price: 33300,
    delivery_fee: 400,
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(), // 35 mins ago
  },
  {
    id: 'ord-84920',
    order_number: 'DZ-84920',
    customer_name: 'ياسين بن عيسى',
    phone: '0662334455',
    wilaya: '31 - وهران',
    wilaya_code: '31',
    commune: 'وهران الوسطى',
    address: 'شارع العربي بن مهيدي، مقابل بنك الجزائر',
    notes: 'الدفع عند الاستلام نقداً مع الفاتورة',
    items: [
      {
        product_id: 'prod-silver-mountain-water',
        name: 'Creed Silver Mountain Water (100ml)',
        price: 29500,
        qty: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSYAKXh0F2qCnzNVpfgUTHDKTcV1dqXfpefwKj_mEGHyoBDjZasPFw7B6yZBBvvbuNskE3ETX8h0l4gu24-PfsaHqq2dAmmBw9xD38uEJPrXvV59TkVxziIXgb_NYHXF6UXbKY2SntLKBbPUH3jn35Etx9_M-vi4rshLlrBiSzm6BiSR62PgdOa_9Gfb13mjbPdllTl6zAW7vNFEVO3mfFbl-ohBvrZwHTkOMxT4onYDorVTzYxVbY'
      }
    ],
    total_price: 30050,
    delivery_fee: 550,
    status: 'confirmed',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: 'ord-84918',
    order_number: 'DZ-84918',
    customer_name: 'نور الهدى قادري',
    phone: '0770889900',
    wilaya: '19 - سطيف',
    wilaya_code: '19',
    commune: 'سطيف - حي بيلير',
    address: 'فيلا رقم 45 قرب ثانوية مالك بن نبي',
    items: [
      {
        product_id: 'prod-wind-flowers',
        name: 'Creed Wind Flowers (75ml)',
        price: 31500,
        qty: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiV5aod7u2d7tdYUVPGzPkTbLk6K0WQx8eM9t_rYUU7wQ6acLw58STGJ5MLKZ_u9VfM0Tu0QRN24hJxj4cUZqUvggBm5vJ44WYFLr6QpToH6XE_jaIQaGg6gt_vRIn54kqUhAiNHj42g2nH28uPlqLo_HmZTJw-fhzbh3jM0WCH2dc7NSvdxvNHPahFHAGfVyPg0hElo_gLRKWGyOoDbLW-gYcU7ZYp6U2shg_k8APkvxu-qN-orzn'
      }
    ],
    total_price: 32100,
    delivery_fee: 600,
    status: 'shipped',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: 'ord-84915',
    order_number: 'DZ-84915',
    customer_name: 'فاروق مزيان',
    phone: '0555667788',
    wilaya: '25 - قسنطينة',
    wilaya_code: '25',
    commune: 'علي منجلي - الوحدة جوارية 05',
    address: 'إقامة النرجس، عمارة 12',
    items: [
      {
        product_id: 'prod-green-irish-tweed',
        name: 'Creed Green Irish Tweed (100ml)',
        price: 28900,
        qty: 1,
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu3v-WtZ3oLnZwnhvgueiZQ0ImNUP5Ysa2WdjEHZAabIuQ9NRcI4JHo7Qlhv0-q3Yf5KUZzyd4wjdtBAgN7Kywjmx0aBpQJOuir0lJIsu_dpz3YUMuM2a08r6bMMjJ1jc6UBqxm_J-rFHReZ3L6k7_9jJZPJDQCH77HlR0lYdG0dp4x4RH4iIvllJW0Vu3Y0CIXO5Vqsqbz9rYoCWCGEFMjkVicG73goUUg9SKA-J1XbdBkzezPSWm'
      }
    ],
    total_price: 29500,
    delivery_fee: 600,
    status: 'delivered',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  }
];
