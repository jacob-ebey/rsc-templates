CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`firstName` text,
	`lastName` text,
	`email` text NOT NULL,
	`invitee` integer,
	`role` text DEFAULT 'guest',
	FOREIGN KEY (`invitee`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `email_idx` ON `users` (`email`);