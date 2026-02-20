-- Seed Event Categories (19 Primary Categories)
INSERT INTO public.event_categories (name, slug, "order") VALUES
('Music', 'music', 1),
('Theatre & Performing Arts', 'theatre-performing-arts', 2),
('Dance', 'dance', 3),
('Visual Arts', 'visual-arts', 4),
('Film & Media', 'film-media', 5),
('Literature', 'literature', 6),
('Educational / Skill-based', 'educational-skill-based', 7),
('Cultural Festivals', 'cultural-festivals', 8),
('Hobby & Lifestyle', 'hobby-lifestyle', 9),
('Competitions', 'competitions', 10),
('Campus Events', 'campus-events', 11),
('Community & Social Impact', 'community-social-impact', 12),
('Corporate & Professional', 'corporate-professional', 13),
('Religious & Spiritual', 'religious-spiritual', 14),
('Family & Kids', 'family-kids', 15),
('Food & Culinary', 'food-culinary', 16),
('Fashion & Lifestyle', 'fashion-lifestyle', 17),
('Sports & Recreation', 'sports-recreation', 18),
('Hybrid / Experimental', 'hybrid-experimental', 19)
ON CONFLICT (slug) DO NOTHING;

-- Seed Event Areas (Dhaka locations)
INSERT INTO public.event_areas (name, slug) VALUES
('Dhanmondi', 'dhanmondi'),
('Gulshan', 'gulshan'),
('Uttara', 'uttara'),
('Banani', 'banani'),
('Wari', 'wari'),
('Old Dhaka', 'old-dhaka'),
('Motijheel', 'motijheel'),
('Mirpur', 'mirpur'),
('Baridhara', 'baridhara'),
('Mohakhali', 'mohakhali'),
('Tejgaon', 'tejgaon'),
('Ramna', 'ramna'),
('Lalmatia', 'lalmatia'),
('Mohammadpur', 'mohammadpur'),
('Shyamoli', 'shyamoli')
ON CONFLICT (slug) DO NOTHING;

-- Seed some common subcategories for Music category
INSERT INTO public.event_subcategories (category_id, name, slug)
SELECT id, 'Live Performances', 'live-performances'
FROM public.event_categories WHERE slug = 'music'
ON CONFLICT DO NOTHING;

INSERT INTO public.event_subcategories (category_id, name, slug)
SELECT id, 'Music Festivals', 'music-festivals'
FROM public.event_categories WHERE slug = 'music'
ON CONFLICT DO NOTHING;

INSERT INTO public.event_subcategories (category_id, name, slug)
SELECT id, 'Music Workshops', 'music-workshops'
FROM public.event_categories WHERE slug = 'music'
ON CONFLICT DO NOTHING;

-- Seed some common tags
INSERT INTO public.event_tags (name, slug) VALUES
('Rock', 'rock'),
('Jazz', 'jazz'),
('Classical', 'classical'),
('Folk', 'folk'),
('EDM', 'edm'),
('Hip Hop', 'hip-hop'),
('Workshop', 'workshop'),
('Exhibition', 'exhibition'),
('Competition', 'competition'),
('Free', 'free'),
('Weekend', 'weekend'),
('Evening', 'evening'),
('Family Friendly', 'family-friendly')
ON CONFLICT (slug) DO NOTHING;
