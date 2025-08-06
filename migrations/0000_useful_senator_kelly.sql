CREATE TYPE "public"."availability_status" AS ENUM('available', 'busy', 'unavailable');--> statement-breakpoint
CREATE TYPE "public"."category" AS ENUM('talent', 'manager', 'producer', 'agent');--> statement-breakpoint
CREATE TYPE "public"."feature_access_type" AS ENUM('social_media', 'job_posting', 'advanced_search', 'media_upload', 'messaging', 'analytics', 'ai_features', 'profile_verification', 'team_collaboration', 'video_conferencing', 'export_data', 'api_access', 'custom_branding', 'priority_support', 'advanced_analytics', 'reports');--> statement-breakpoint
CREATE TYPE "public"."friendship_status" AS ENUM('pending', 'accepted', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."job_history_type" AS ENUM('feature_film', 'short_film', 'tv_show', 'tv_series', 'commercial', 'fashion_show', 'advertisement', 'music_concert', 'theater', 'voice_over', 'modeling', 'documentary', 'web_series', 'music_video', 'corporate_video', 'live_performance', 'radio', 'podcast', 'audiobook', 'gaming', 'animation');--> statement-breakpoint
CREATE TYPE "public"."job_status" AS ENUM('open', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."meeting_status" AS ENUM('scheduled', 'confirmed', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."meeting_type" AS ENUM('in_person', 'virtual');--> statement-breakpoint
CREATE TYPE "public"."message_status" AS ENUM('sent', 'delivered', 'read');--> statement-breakpoint
CREATE TYPE "public"."permission_action" AS ENUM('create', 'read', 'update', 'delete', 'approve', 'reject', 'publish', 'unpublish', 'verify', 'unverify', 'export', 'import', 'moderate', 'assign', 'unassign');--> statement-breakpoint
CREATE TYPE "public"."permission_category" AS ENUM('user_management', 'profile_management', 'media_management', 'job_management', 'application_management', 'messaging', 'analytics', 'system_settings', 'content_moderation', 'billing_payments', 'verification', 'notifications', 'calendar_scheduling', 'ai_features', 'reports');--> statement-breakpoint
CREATE TYPE "public"."post_privacy" AS ENUM('public', 'friends', 'private');--> statement-breakpoint
CREATE TYPE "public"."professional_connection_type" AS ENUM('manager', 'agent', 'pr', 'publicist', 'attorney', 'accountant', 'coach', 'mentor');--> statement-breakpoint
CREATE TYPE "public"."promo_code_plan" AS ENUM('all', 'monthly_only', 'annual_only', 'specific_tier');--> statement-breakpoint
CREATE TYPE "public"."promo_code_type" AS ENUM('percentage', 'fixed_amount', 'first_month_free', 'first_month_discount');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('select', 'multiselect', 'text', 'textarea', 'number', 'boolean', 'scale');--> statement-breakpoint
CREATE TYPE "public"."representation_type" AS ENUM('manager', 'agent', 'publicist', 'attorney', 'brand_manager', 'booking_agent', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."talent_type" AS ENUM('actor', 'musician', 'voice_artist', 'model', 'profile');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('talent', 'manager', 'producer', 'admin');--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"resource" varchar NOT NULL,
	"resource_id" varchar,
	"details" jsonb,
	"ip_address" varchar,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"value" text,
	"description" text,
	"encrypted" boolean DEFAULT false,
	"updated_by" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "admin_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "ai_generated_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"content_type" varchar NOT NULL,
	"prompt" text NOT NULL,
	"generated_content" text NOT NULL,
	"model" varchar NOT NULL,
	"tokens" integer,
	"approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"event" varchar NOT NULL,
	"user_id" varchar,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "availability_calendar" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "availability_status" DEFAULT 'available' NOT NULL,
	"notes" text,
	"all_day" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_room_id" integer,
	"sender_id" varchar NOT NULL,
	"content" text NOT NULL,
	"message_type" varchar DEFAULT 'text',
	"metadata" jsonb,
	"encrypted" boolean DEFAULT true,
	"edited_at" timestamp,
	"reply_to_id" integer,
	"status" "message_status" DEFAULT 'sent',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chat_room_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"chat_room_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"role" varchar DEFAULT 'member',
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "chat_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" varchar DEFAULT 'group',
	"created_by" varchar NOT NULL,
	"is_public" boolean DEFAULT false,
	"max_members" integer DEFAULT 50,
	"encrypted" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "email_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"status" varchar(50) NOT NULL,
	"target_groups" text[] NOT NULL,
	"template" jsonb NOT NULL,
	"scheduled_for" timestamp,
	"sent_count" integer DEFAULT 0,
	"failed_count" integer DEFAULT 0,
	"total_targets" integer DEFAULT 0,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"subject" varchar NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"category" varchar NOT NULL,
	"active" boolean DEFAULT true,
	"description" text,
	"content" text,
	"elements" jsonb[],
	"preview_text" text,
	"is_default" boolean DEFAULT false,
	"variables" jsonb DEFAULT '[]',
	"from_name" varchar DEFAULT 'Talents & Stars',
	"from_email" varchar DEFAULT 'noreply@talentsandstars.com',
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "email_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "friendships" (
	"id" serial PRIMARY KEY NOT NULL,
	"requester_id" integer NOT NULL,
	"addressee_id" integer NOT NULL,
	"status" "friendship_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"cover_letter" text,
	"proposed_rate" numeric(10, 2),
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_communications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"sender_id" integer NOT NULL,
	"receiver_id" integer NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"company" varchar NOT NULL,
	"job_type" "job_history_type" NOT NULL,
	"role" varchar NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"location" varchar,
	"description" text,
	"credits" text,
	"is_public" boolean DEFAULT true,
	"verified" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"user_id" varchar NOT NULL,
	"match_score" numeric(5, 2),
	"match_reasons" text[],
	"notified" boolean DEFAULT false,
	"viewed" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"talent_type" "talent_type" NOT NULL,
	"location" varchar,
	"budget" numeric(10, 2),
	"project_date" timestamp,
	"requirements" text,
	"status" "job_status" DEFAULT 'open',
	"is_public" boolean DEFAULT true,
	"allow_communication" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "legal_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"version" varchar(20) NOT NULL,
	"is_active" boolean DEFAULT true,
	"effective_date" timestamp NOT NULL,
	"updated_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_file_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_file_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"filename" varchar,
	"original_name" varchar,
	"mime_type" varchar,
	"size" integer,
	"url" varchar NOT NULL,
	"thumbnail_url" varchar,
	"media_type" varchar NOT NULL,
	"tags" text[],
	"title" varchar,
	"description" text,
	"category" varchar DEFAULT 'portfolio',
	"is_public" boolean DEFAULT true,
	"external_url" varchar,
	"external_platform" varchar,
	"external_id" varchar,
	"duration" integer,
	"is_external" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_processing_queue" (
	"id" serial PRIMARY KEY NOT NULL,
	"media_file_id" integer NOT NULL,
	"status" varchar DEFAULT 'pending',
	"processing_type" varchar NOT NULL,
	"progress" integer DEFAULT 0,
	"error_message" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "media_uploads" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"filename" varchar(255) NOT NULL,
	"original_filename" varchar(255),
	"title" varchar(255),
	"description" text,
	"category" varchar(100),
	"file_type" varchar(50),
	"file_size" integer,
	"media_url" varchar(500),
	"thumbnail_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meeting_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user_id" varchar NOT NULL,
	"to_user_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"requested_date" timestamp NOT NULL,
	"requested_time" time,
	"duration" integer DEFAULT 60,
	"meeting_type" varchar DEFAULT 'video',
	"location" varchar,
	"status" varchar DEFAULT 'pending',
	"response_message" text,
	"responded_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "meetings" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"organizer_id" varchar NOT NULL,
	"attendee_id" varchar NOT NULL,
	"meeting_date" timestamp NOT NULL,
	"duration" integer DEFAULT 60,
	"type" "meeting_type" NOT NULL,
	"status" "meeting_status" DEFAULT 'scheduled' NOT NULL,
	"location" text,
	"virtual_link" text,
	"platform" varchar,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"sender_id" varchar NOT NULL,
	"receiver_id" varchar NOT NULL,
	"content" text NOT NULL,
	"status" "message_status" DEFAULT 'sent',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"message" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"token" varchar NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "password_reset_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "payment_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"total_revenue" numeric(10, 2) DEFAULT '0.00',
	"total_transactions" integer DEFAULT 0,
	"successful_transactions" integer DEFAULT 0,
	"failed_transactions" integer DEFAULT 0,
	"refunded_transactions" integer DEFAULT 0,
	"total_refunds" numeric(10, 2) DEFAULT '0.00',
	"average_transaction_amount" numeric(10, 2) DEFAULT '0.00',
	"new_customers" integer DEFAULT 0,
	"monthly_subscriptions" integer DEFAULT 0,
	"annual_subscriptions" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_refunds" (
	"id" serial PRIMARY KEY NOT NULL,
	"transaction_id" integer NOT NULL,
	"stripe_refund_id" varchar,
	"amount" numeric(10, 2) NOT NULL,
	"reason" varchar,
	"status" varchar NOT NULL,
	"admin_notes" text,
	"processed_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payment_refunds_stripe_refund_id_unique" UNIQUE("stripe_refund_id")
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"stripe_payment_intent_id" varchar,
	"stripe_charge_id" varchar,
	"amount" numeric(10, 2) NOT NULL,
	"currency" varchar DEFAULT 'usd',
	"status" varchar NOT NULL,
	"payment_method" varchar,
	"tier_id" integer,
	"is_annual" boolean DEFAULT false,
	"description" text,
	"metadata" jsonb,
	"stripe_customer_id" varchar,
	"receipt_url" varchar,
	"refunded_amount" numeric(10, 2) DEFAULT '0.00',
	"refund_reason" text,
	"refunded_at" timestamp,
	"refunded_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "payment_transactions_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "post_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"likes" integer DEFAULT 0,
	"parent_comment_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "pricing_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"annual_price" numeric(10, 2) DEFAULT '0',
	"duration" integer NOT NULL,
	"features" text[] NOT NULL,
	"is_active" boolean DEFAULT true,
	"category" "category" DEFAULT 'talent' NOT NULL,
	"max_photos" integer DEFAULT 0,
	"max_videos" integer DEFAULT 0,
	"max_audio" integer DEFAULT 0,
	"max_external_links" integer DEFAULT 0,
	"max_storage_gb" integer DEFAULT 1,
	"max_projects" integer DEFAULT 0,
	"max_applications" integer DEFAULT 0,
	"has_analytics" boolean DEFAULT false,
	"has_messaging" boolean DEFAULT false,
	"has_ai_features" boolean DEFAULT false,
	"has_priority_support" boolean DEFAULT false,
	"can_create_jobs" boolean DEFAULT false,
	"can_view_profiles" boolean DEFAULT true,
	"can_export_data" boolean DEFAULT false,
	"has_social_features" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "professional_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" integer NOT NULL,
	"professional_id" integer NOT NULL,
	"connection_type" "professional_connection_type" NOT NULL,
	"status" varchar DEFAULT 'active',
	"contract_start_date" timestamp,
	"contract_end_date" timestamp,
	"commission_rate" numeric(5, 2),
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_type" "talent_type" NOT NULL,
	"question" text NOT NULL,
	"field_name" varchar NOT NULL,
	"field_type" varchar NOT NULL,
	"required" boolean DEFAULT false,
	"options" text[],
	"order" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile_sharing" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"share_title" varchar,
	"share_description" text,
	"share_image_url" varchar,
	"show_contact" boolean DEFAULT true,
	"show_skills" boolean DEFAULT true,
	"show_experience" boolean DEFAULT true,
	"show_media" boolean DEFAULT true,
	"custom_message" text,
	"share_count" integer DEFAULT 0,
	"last_shared_at" timestamp,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profile_sharing_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"custom_url" varchar,
	"is_public" boolean DEFAULT true,
	"allow_direct_messages" boolean DEFAULT true,
	"show_contact_info" boolean DEFAULT false,
	"show_social_links" boolean DEFAULT true,
	"show_social_media" boolean DEFAULT true,
	"show_media_gallery" boolean DEFAULT true,
	"allow_non_account_holders" boolean DEFAULT true,
	"completely_private" boolean DEFAULT false,
	"shareable_fields" text[] DEFAULT '{}',
	"profile_views" integer DEFAULT 0,
	"last_shared" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profile_sharing_settings_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "profile_sharing_settings_custom_url_unique" UNIQUE("custom_url")
);
--> statement-breakpoint
CREATE TABLE "promo_code_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"promo_code_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"pricing_tier_id" integer NOT NULL,
	"original_amount" numeric(10, 2) NOT NULL,
	"discount_amount" numeric(10, 2) NOT NULL,
	"final_amount" numeric(10, 2) NOT NULL,
	"plan_type" varchar NOT NULL,
	"used_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "promo_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" "promo_code_type" NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"planRestriction" "promo_code_plan" DEFAULT 'all',
	"specificTierId" integer,
	"categoryRestriction" "category",
	"maxUses" integer,
	"usedCount" integer DEFAULT 0,
	"maxUsesPerUser" integer DEFAULT 1,
	"startsAt" timestamp,
	"expiresAt" timestamp,
	"discount_duration_months" integer,
	"auto_downgrade_on_expiry" boolean DEFAULT false,
	"active" boolean DEFAULT true,
	"createdBy" integer NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "promo_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "questionnaire_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"slug" varchar NOT NULL,
	"description" text,
	"target_roles" text[],
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "questionnaire_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "questionnaire_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"question" text NOT NULL,
	"slug" varchar NOT NULL,
	"question_type" "question_type" NOT NULL,
	"options" jsonb,
	"is_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"help_text" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questionnaire_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"question_id" integer NOT NULL,
	"response" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"role" "user_role" NOT NULL,
	"category" "permission_category" NOT NULL,
	"action" "permission_action" NOT NULL,
	"resource" varchar,
	"granted" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seo_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"image_url" varchar NOT NULL,
	"alt" varchar NOT NULL,
	"width" integer,
	"height" integer,
	"file_size" integer,
	"format" varchar,
	"is_default" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"tags" text[] DEFAULT '{}',
	"created_by" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "seo_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"route" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"keywords" text[] DEFAULT '{}',
	"seo_image_url" varchar,
	"og_title" varchar,
	"og_description" text,
	"og_image_url" varchar,
	"twitter_title" varchar,
	"twitter_description" text,
	"twitter_image_url" varchar,
	"canonical_url" varchar,
	"no_index" boolean DEFAULT false,
	"no_follow" boolean DEFAULT false,
	"structured_data" jsonb DEFAULT '{}'::jsonb,
	"priority" numeric(2, 1) DEFAULT '0.5',
	"change_freq" varchar DEFAULT 'monthly',
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "seo_pages_route_unique" UNIQUE("route")
);
--> statement-breakpoint
CREATE TABLE "seo_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_name" varchar DEFAULT 'Talents & Stars' NOT NULL,
	"site_description" text DEFAULT 'AI-powered platform connecting entertainment professionals with their next big break' NOT NULL,
	"site_keywords" text[] DEFAULT '{}',
	"site_url" varchar DEFAULT 'https://talentsandstars.com' NOT NULL,
	"default_seo_image_url" varchar,
	"twitter_handle" varchar,
	"facebook_app_id" varchar,
	"google_analytics_id" varchar,
	"google_tag_manager_id" varchar,
	"verification_codes" jsonb DEFAULT '{}'::jsonb,
	"structured_data_enabled" boolean DEFAULT true,
	"open_graph_enabled" boolean DEFAULT true,
	"twitter_card_enabled" boolean DEFAULT true,
	"robots_config" jsonb DEFAULT '{}'::jsonb,
	"sitemap_enabled" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skill_endorsements" (
	"id" serial PRIMARY KEY NOT NULL,
	"endorser_id" varchar NOT NULL,
	"endorsed_user_id" varchar NOT NULL,
	"skill" varchar NOT NULL,
	"message" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"friend_id" integer NOT NULL,
	"status" varchar DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"interaction_type" varchar NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_media_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"platform" varchar NOT NULL,
	"username" varchar,
	"url" varchar NOT NULL,
	"display_name" varchar,
	"is_visible" boolean DEFAULT true,
	"icon_color" varchar,
	"sort_order" integer DEFAULT 0,
	"verified_at" timestamp,
	"click_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "social_posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"media_ids" integer[],
	"privacy" "post_privacy" DEFAULT 'public' NOT NULL,
	"tagged_users" integer[],
	"likes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"shares" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" varchar NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"category" varchar NOT NULL,
	"data_type" varchar NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	"updated_by" varchar,
	CONSTRAINT "system_settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "talent_managers" (
	"id" serial PRIMARY KEY NOT NULL,
	"talent_id" varchar NOT NULL,
	"manager_id" varchar NOT NULL,
	"status" varchar DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_availability" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" date NOT NULL,
	"status" varchar(20) DEFAULT 'available',
	"event_title" varchar(255),
	"event_description" text,
	"start_time" time,
	"end_time" time,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_discount_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"promo_code_id" integer NOT NULL,
	"original_tier_id" integer,
	"discount_tier_id" integer,
	"discount_percentage" numeric(5, 2),
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"auto_downgrade_scheduled" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_feature_access" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"feature_type" "feature_access_type" NOT NULL,
	"has_access" boolean DEFAULT false,
	"granted_by" integer,
	"granted_at" timestamp,
	"expires_at" timestamp,
	"reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"category" "permission_category" NOT NULL,
	"action" "permission_action" NOT NULL,
	"resource" varchar,
	"granted" boolean DEFAULT true NOT NULL,
	"granted_by" varchar,
	"expires_at" timestamp,
	"conditions" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_privacy_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"profile_visibility" varchar DEFAULT 'public',
	"searchable" boolean DEFAULT true,
	"allow_friend_requests" boolean DEFAULT true,
	"allow_messages" boolean DEFAULT true,
	"allow_tagging" boolean DEFAULT true,
	"show_online_status" boolean DEFAULT true,
	"show_activity" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"role" "user_role" NOT NULL,
	"talent_type" "talent_type",
	"display_name" varchar,
	"bio" text,
	"location" varchar,
	"website" varchar,
	"phone_number" varchar,
	"social_links" jsonb,
	"is_verified" boolean DEFAULT false,
	"availability_status" "availability_status" DEFAULT 'available',
	"height" varchar,
	"weight" varchar,
	"eye_color" text[],
	"hair_color" text[],
	"union_status" text[],
	"shoe_size" varchar,
	"languages" text[],
	"accents" text[],
	"instruments" text[],
	"genres" text[],
	"vocal_range" text[],
	"body_stats" text,
	"walk_type" varchar,
	"affiliations" text[],
	"stunts" text[],
	"activities" text[],
	"awards" text[],
	"experiences" text[],
	"skills" text[],
	"wardrobe" text[],
	"tattoos" varchar,
	"piercings" varchar,
	"scars" varchar,
	"dancing_styles" text[],
	"sporting_activities" text[],
	"driving_licenses" text[],
	"daily_rate" numeric(10, 2),
	"weekly_rate" numeric(10, 2),
	"project_rate" numeric(10, 2),
	"resume" text,
	"credits" jsonb,
	"representations" jsonb,
	"questionnaire_responses" jsonb,
	"primary_specialty" text[],
	"years_experience" varchar,
	"acting_method" text[],
	"improvisation_comfort" varchar,
	"stage_combat" varchar,
	"intimate_scenes_comfort" varchar,
	"role_types" text[],
	"motion_capture" varchar,
	"animal_work" varchar,
	"crying_on_cue" varchar,
	"period_pieces" varchar,
	"physical_comedy" varchar,
	"accent_experience" varchar,
	"green_screen" varchar,
	"stunt_comfort" varchar,
	"shakespeare_experience" varchar,
	"musical_theater" varchar,
	"horror_thriller" text[],
	"current_agent" varchar,
	"current_publicist" varchar,
	"representation_status" varchar,
	"profile_views" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"featured_at" timestamp,
	"featured_tier" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_representation" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"representation_type" "representation_type" NOT NULL,
	"name" varchar NOT NULL,
	"company" varchar,
	"email" varchar,
	"phone" varchar,
	"website" varchar,
	"notes" text,
	"is_primary" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_subscriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"pricing_tier_id" integer NOT NULL,
	"stripe_subscription_id" varchar,
	"stripe_customer_id" varchar,
	"status" varchar DEFAULT 'active',
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar NOT NULL,
	"color" varchar DEFAULT '#3B82F6',
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar NOT NULL,
	"password" varchar NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"main_image_url" varchar,
	"hero_image_url" varchar,
	"profile_template" varchar DEFAULT 'classic',
	"role" "user_role" DEFAULT 'talent',
	"pricing_tier_id" integer,
	"language" varchar DEFAULT 'en',
	"terms_accepted" boolean DEFAULT false,
	"privacy_accepted" boolean DEFAULT false,
	"terms_accepted_at" timestamp,
	"privacy_accepted_at" timestamp,
	"terms_version" integer,
	"privacy_version" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"document_type" varchar(100) NOT NULL,
	"document_url" varchar(500) NOT NULL,
	"document_name" varchar(255),
	"status" varchar(20) DEFAULT 'pending',
	"admin_notes" text,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp,
	"reviewed_by" integer
);
--> statement-breakpoint
CREATE TABLE "verification_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"document_type" varchar NOT NULL,
	"document_url" varchar NOT NULL,
	"status" varchar DEFAULT 'pending',
	"reviewed_by" varchar,
	"review_notes" text,
	"submitted_at" timestamp DEFAULT now(),
	"reviewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_settings" ADD CONSTRAINT "admin_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_generated_content" ADD CONSTRAINT "ai_generated_content_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics" ADD CONSTRAINT "analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "availability_calendar" ADD CONSTRAINT "availability_calendar_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_chat_room_id_chat_rooms_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_participants" ADD CONSTRAINT "chat_room_participants_chat_room_id_chat_rooms_id_fk" FOREIGN KEY ("chat_room_id") REFERENCES "public"."chat_rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_room_participants" ADD CONSTRAINT "chat_room_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_rooms" ADD CONSTRAINT "chat_rooms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addressee_id_users_id_fk" FOREIGN KEY ("addressee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_communications" ADD CONSTRAINT "job_communications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_communications" ADD CONSTRAINT "job_communications_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_communications" ADD CONSTRAINT "job_communications_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_history" ADD CONSTRAINT "job_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legal_documents" ADD CONSTRAINT "legal_documents_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_file_tags" ADD CONSTRAINT "media_file_tags_media_file_id_media_files_id_fk" FOREIGN KEY ("media_file_id") REFERENCES "public"."media_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_file_tags" ADD CONSTRAINT "media_file_tags_tag_id_user_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."user_tags"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_files" ADD CONSTRAINT "media_files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_processing_queue" ADD CONSTRAINT "media_processing_queue_media_file_id_media_files_id_fk" FOREIGN KEY ("media_file_id") REFERENCES "public"."media_files"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_uploads" ADD CONSTRAINT "media_uploads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_requests" ADD CONSTRAINT "meeting_requests_from_user_id_users_id_fk" FOREIGN KEY ("from_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_requests" ADD CONSTRAINT "meeting_requests_to_user_id_users_id_fk" FOREIGN KEY ("to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meetings" ADD CONSTRAINT "meetings_attendee_id_users_id_fk" FOREIGN KEY ("attendee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_users_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_transaction_id_payment_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_refunds" ADD CONSTRAINT "payment_refunds_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_tier_id_pricing_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."pricing_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_refunded_by_users_id_fk" FOREIGN KEY ("refunded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_post_id_social_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."social_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_comments" ADD CONSTRAINT "post_comments_parent_comment_id_post_comments_id_fk" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."post_comments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_post_id_social_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."social_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_connections" ADD CONSTRAINT "professional_connections_talent_id_users_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "professional_connections" ADD CONSTRAINT "professional_connections_professional_id_users_id_fk" FOREIGN KEY ("professional_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_sharing" ADD CONSTRAINT "profile_sharing_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_sharing_settings" ADD CONSTRAINT "profile_sharing_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_code_usage" ADD CONSTRAINT "promo_code_usage_pricing_tier_id_pricing_tiers_id_fk" FOREIGN KEY ("pricing_tier_id") REFERENCES "public"."pricing_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_specificTierId_pricing_tiers_id_fk" FOREIGN KEY ("specificTierId") REFERENCES "public"."pricing_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promo_codes" ADD CONSTRAINT "promo_codes_createdBy_users_id_fk" FOREIGN KEY ("createdBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_questions" ADD CONSTRAINT "questionnaire_questions_category_id_questionnaire_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."questionnaire_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_question_id_questionnaire_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questionnaire_questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seo_images" ADD CONSTRAINT "seo_images_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_endorsements" ADD CONSTRAINT "skill_endorsements_endorser_id_users_id_fk" FOREIGN KEY ("endorser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skill_endorsements" ADD CONSTRAINT "skill_endorsements_endorsed_user_id_users_id_fk" FOREIGN KEY ("endorsed_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_connections" ADD CONSTRAINT "social_connections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_connections" ADD CONSTRAINT "social_connections_friend_id_users_id_fk" FOREIGN KEY ("friend_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_interactions" ADD CONSTRAINT "social_interactions_post_id_social_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."social_posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_interactions" ADD CONSTRAINT "social_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_media_links" ADD CONSTRAINT "social_media_links_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_posts" ADD CONSTRAINT "social_posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_managers" ADD CONSTRAINT "talent_managers_talent_id_users_id_fk" FOREIGN KEY ("talent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "talent_managers" ADD CONSTRAINT "talent_managers_manager_id_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_availability" ADD CONSTRAINT "user_availability_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_discount_periods" ADD CONSTRAINT "user_discount_periods_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_discount_periods" ADD CONSTRAINT "user_discount_periods_promo_code_id_promo_codes_id_fk" FOREIGN KEY ("promo_code_id") REFERENCES "public"."promo_codes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_discount_periods" ADD CONSTRAINT "user_discount_periods_original_tier_id_pricing_tiers_id_fk" FOREIGN KEY ("original_tier_id") REFERENCES "public"."pricing_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_discount_periods" ADD CONSTRAINT "user_discount_periods_discount_tier_id_pricing_tiers_id_fk" FOREIGN KEY ("discount_tier_id") REFERENCES "public"."pricing_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feature_access" ADD CONSTRAINT "user_feature_access_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_feature_access" ADD CONSTRAINT "user_feature_access_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_privacy_settings" ADD CONSTRAINT "user_privacy_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_representation" ADD CONSTRAINT "user_representation_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_subscriptions" ADD CONSTRAINT "user_subscriptions_pricing_tier_id_pricing_tiers_id_fk" FOREIGN KEY ("pricing_tier_id") REFERENCES "public"."pricing_tiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");